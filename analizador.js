const btnEnviar = document.getElementById('btn-enviar');
const entradaCodigo = document.getElementById('entrada-codigo');
const salidaResultado = document.getElementById('salida-resultado');
const salidaAst = document.getElementById('salida-ast');
const erroresBody = document.getElementById('errores-body');
const simbolosBody = document.getElementById('simbolos-body');
const noErrores = document.getElementById('no-errores');
const noSimbolos = document.getElementById('no-simbolos');
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.removeAttribute('data-theme');
    }
}

function updateThemeButton() {
    const isDark = root.getAttribute('data-theme') === 'dark';
    themeToggle.textContent = isDark ? 'Light' : 'Dark';
}

if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
} else {
    applyTheme(systemThemeQuery.matches ? 'dark' : 'light');
}

systemThemeQuery.addEventListener('change', (event) => {
    const userPreference = localStorage.getItem('theme');

    if (userPreference === 'dark' || userPreference === 'light') {
        return;
    }

    applyTheme(event.matches ? 'dark' : 'light');
    updateThemeButton();
});

updateThemeButton();

themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateThemeButton();
});

function clearRows() {
    erroresBody.innerHTML = '';
    simbolosBody.innerHTML = '';
}

function toggleNoData(element, hasData) {
    element.classList.toggle('hidden', hasData);
}

function addErrorRows(errores) {
    if (!Array.isArray(errores) || errores.length === 0) {
        toggleNoData(noErrores, false);
        return;
    }

    toggleNoData(noErrores, true);

    errores.forEach((error, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="#">${index + 1}</td>
            <td data-label="Tipo">${error.tipo ?? ''}</td>
            <td data-label="Descripción">${error.descripcion ?? ''}</td>
            <td data-label="Línea">${error.linea ?? ''}</td>
            <td data-label="Columna">${error.columna ?? ''}</td>
            <td data-label="Detalles">${error.detalles ?? ''}</td>
        `;
        erroresBody.appendChild(row);
    });
}

function addSymbolRows(simbolos) {
    if (!Array.isArray(simbolos) || simbolos.length === 0) {
        toggleNoData(noSimbolos, false);
        return;
    }

    toggleNoData(noSimbolos, true);

    simbolos.forEach((simbolo, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="#">${index + 1}</td>
            <td data-label="Nombre">${simbolo.nombre ?? ''}</td>
            <td data-label="Tipo">${simbolo.tipo ?? ''}</td>
            <td data-label="Valor">${simbolo.valor ?? ''}</td>
            <td data-label="Ámbito">${simbolo.ambito ?? ''}</td>
            <td data-label="Entorno">${simbolo.entorno ?? ''}</td>
            <td data-label="Línea">${simbolo.linea ?? ''}</td>
            <td data-label="Columna">${simbolo.columna ?? ''}</td>
        `;
        simbolosBody.appendChild(row);
    });
}

function extraerLineaColumna(mensaje) {
    if (typeof mensaje !== 'string') {
        return { linea: '', columna: '' };
    }

    const match = mensaje.match(/\[(\d+):(\d+)\]/);
    if (!match) {
        return { linea: '', columna: '' };
    }

    return {
        linea: Number(match[1]),
        columna: Number(match[2])
    };
}

function normalizarErroresSemanticos(errores) {
    if (!Array.isArray(errores)) {
        return [];
    }

    return errores.map((mensaje) => {
        const { linea, columna } = extraerLineaColumna(mensaje);
        return {
            tipo: 'Semántico',
            descripcion: mensaje,
            linea,
            columna,
            detalles: 'Detectado durante interpretación'
        };
    });
}

function normalizarErrorSintactico(error) {
    const linea = error?.hash?.loc?.first_line ?? error?.hash?.line ?? '';
    const columna = error?.hash?.loc?.first_column ?? '';
    const token = error?.hash?.token ? `Token: ${error.hash.token}` : '';

    return {
        tipo: 'Sintáctico',
        descripcion: error?.message ?? 'Error sintáctico',
        linea,
        columna,
        detalles: token
    };
}

function construirErrorSintactico(str, hash) {
    const linea = hash?.loc?.first_line ?? hash?.line ?? '';
    const columna = hash?.loc?.first_column ?? '';
    const token = hash?.token ? `Token: ${hash.token}` : '';

    return {
        tipo: 'Sintáctico',
        descripcion: str || 'Error sintáctico',
        linea,
        columna,
        detalles: token
    };
}

function parsearConRecuperacion(codigo) {
    if (typeof parser === 'undefined') {
        throw new Error('Parser no disponible');
    }

    parser.yy = parser.yy || {};
    const erroresSintacticos = [];
    const parseErrorOriginal = parser.yy.parseError;

    parser.yy.parseError = (str, hash) => {
        erroresSintacticos.push(construirErrorSintactico(str, hash));

        if (!hash?.recoverable) {
            const fatal = new Error(str || 'Error sintáctico fatal');
            fatal.hash = hash;
            fatal.erroresSintacticos = [...erroresSintacticos];
            throw fatal;
        }
    };

    try {
        const ast = parser.parse(codigo);
        return { ast, erroresSintacticos };
    } catch (error) {
        if (!Array.isArray(error.erroresSintacticos)) {
            error.erroresSintacticos = [...erroresSintacticos];
        }
        throw error;
    } finally {
        if (typeof parseErrorOriginal === 'function') {
            parser.yy.parseError = parseErrorOriginal;
        } else {
            delete parser.yy.parseError;
        }
    }
}

function normalizarSimbolos(simbolos) {
    if (!Array.isArray(simbolos)) {
        return [];
    }

    return simbolos.map((simbolo) => ({
        ...simbolo,
        ambito: simbolo.tipoDato ?? simbolo.ambito ?? ''
    }));
}

btnEnviar.addEventListener('click', async () => {
    const codigo = entradaCodigo.value.trim();

    if (!codigo) {
        salidaResultado.value = 'Ingresa código para analizar.';
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Analizando...';
    clearRows();
    if (salidaAst) {
        salidaAst.value = '';
    }
    toggleNoData(noErrores, false);
    toggleNoData(noSimbolos, false);

    try {
        if (typeof parser === 'undefined' || typeof Interprete === 'undefined') {
            throw new Error('No se pudo cargar el compilador local. Verifica los scripts en /compiler.');
        }

        const { ast, erroresSintacticos } = parsearConRecuperacion(codigo);

        if (typeof GeneradorAST !== 'undefined' && salidaAst) {
            const generador = new GeneradorAST();
            salidaAst.value = generador.generar(ast);
        }

        const interprete = new Interprete();
        interprete.interpretar(ast);

        const salida = Array.isArray(interprete.salida) ? interprete.salida.join('') : '';
        const errores = [
            ...erroresSintacticos,
            ...normalizarErroresSemanticos(interprete.obtenerErrores())
        ];
        const simbolos = normalizarSimbolos(interprete.obtenerTablaSimbolos());

        salidaResultado.value = salida || (errores.length > 0 ? 'Análisis completado con errores.' : 'Ejecución completada.');
        addErrorRows(errores);
        addSymbolRows(simbolos);
    } catch (error) {
        const erroresCapturados = Array.isArray(error.erroresSintacticos) && error.erroresSintacticos.length > 0
            ? error.erroresSintacticos
            : [normalizarErrorSintactico(error)];

        salidaResultado.value = error.message?.includes('Parsing halted while starting to recover from another error')
            ? 'Se detectaron múltiples errores sintácticos seguidos. Revisa la tabla de errores para corregirlos.'
            : `Error al analizar: ${error.message}`;
        if (salidaAst) {
            salidaAst.value = 'No se pudo generar el AST debido a errores de análisis.';
        }
        addErrorRows(erroresCapturados);
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Ejecutar análisis';
    }
});

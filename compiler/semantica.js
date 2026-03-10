class TablaSimbolos {
    constructor(padre = null, nombre = 'Global', tipoAmbito = 'global') {
        this.simbolos = {};
        this.padre = padre;
        this.nombre = nombre;
        this.tipoAmbito = tipoAmbito; // 'global', 'funcion', 'procedimiento', 'bloque', 'metodo'
        this.hijos = [];
        
        // Si tiene padre, registrarse como hijo
        if (this.padre) {
            this.padre.hijos.push(this);
        }
    }

    agregar(nombre, tipo, valor, linea, columna) {
        // Verificar si ya existe en el ámbito actual
        if (this.simbolos[nombre]) {
            throw new Error(`Error semántico [${linea}:${columna}]: La variable '${nombre}' ya fue declarada en este ámbito`);
        }
        
        // Verificar shadowing: permitir redeclaración en ámbitos anidados
        // pero no en el mismo ámbito
        this.simbolos[nombre] = { 
            tipo, 
            valor, 
            linea, 
            columna,
            ambito: this.nombre,
            tipoAmbito: this.tipoAmbito
        };
    }

    obtener(nombre) {
        // Buscar en el ámbito actual primero (shadowing)
        if (this.simbolos[nombre]) {
            return this.simbolos[nombre];
        }
        // Buscar en ámbitos padres (ámbito léxico)
        if (this.padre) {
            return this.padre.obtener(nombre);
        }
        return null;
    }

    obtenerEnAmbitoActual(nombre) {
        // Solo busca en el ámbito actual, sin subir a padres
        return this.simbolos[nombre] || null;
    }

    actualizar(nombre, valor, linea, columna) {
        // Actualizar en ámbito actual si existe
        if (this.simbolos[nombre]) {
            // No permitir cambiar el tipo
            const tipoOriginal = this.simbolos[nombre].tipo;
            if (valor.tipoDato && tipoOriginal !== valor.tipoDato) {
                throw new Error(`Error semántico [${linea}:${columna}]: No se puede cambiar el tipo de '${nombre}' de '${tipoOriginal}' a '${valor.tipoDato}'`);
            }
            this.simbolos[nombre].valor = valor;
            return true;
        }
        // Buscar en ámbitos padres (ámbito léxico)
        if (this.padre) {
            return this.padre.actualizar(nombre, valor, linea, columna);
        }
        throw new Error(`Error semántico [${linea}:${columna}]: La variable '${nombre}' no ha sido declarada`);
    }

    obtenerTodos() {
        return this.simbolos;
    }

    obtenerTodosRecursivos() {
        const todosSimbolos = { ...this.simbolos };
        
        for (const hijo of this.hijos) {
            const simbolosHijo = hijo.obtenerTodosRecursivos();
            Object.assign(todosSimbolos, simbolosHijo);
        }
        
        return todosSimbolos;
    }

    imprimirTabla(nivel = 0) {
        const indent = '  '.repeat(nivel);
        console.log(`${indent}=== TABLA DE SÍMBOLOS (${this.nombre}) [${this.tipoAmbito}] ===`);
        for (const [nombre, info] of Object.entries(this.simbolos)) {
            console.log(`${indent}${nombre}: ${info.tipo} = ${JSON.stringify(info.valor)} [${info.ambito}]`);
        }
        
        // Imprimir hijos recursivamente
        for (const hijo of this.hijos) {
            hijo.imprimirTabla(nivel + 1);
        }
    }

    // Método para obtener información del ámbito
    obtenerInfoAmbito() {
        return {
            nombre: this.nombre,
            tipo: this.tipoAmbito,
            padre: this.padre ? this.padre.nombre : null,
            numSimbolos: Object.keys(this.simbolos).length,
            numHijos: this.hijos.length
        };
    }
}

function filtrarAST(ast) {
    if (!Array.isArray(ast)) return ast;
    
    return ast.filter(item => {
        if (typeof item === 'string' && (item === ';' || item === ',')) return false;
        if (item && typeof item === 'object' && !item.tipo) return false;
        return true;
    });
}

class Interprete {
    constructor() {
        this.tablaGlobal = new TablaSimbolos();
        this.errores = [];
        this.salida = [];
        this.enCiclo = false;
        this.enFuncion = false;
        this.valorRetorno = null;
        this.funcionesDeclaradas = new Set(); // Para seguimiento de funciones declaradas
    }

    interpretar(instrucciones) {
        // Filtrar el AST primero
        const instruccionesFiltradas = filtrarAST(instrucciones);
        
        //console.log('DEBUG - AST después de filtrar:', JSON.stringify(instruccionesFiltradas, null, 2));
        
        // FASE 1: Recolectar todas las declaraciones de funciones y procedimientos
        this.recolectarDeclaracionesFunciones(instruccionesFiltradas, this.tablaGlobal);
        
        // FASE 2: Ejecutar todas las instrucciones
        const resultados = [];
        for (const instruccion of instruccionesFiltradas) {
            try {
                const resultado = this.ejecutarInstruccion(instruccion, this.tablaGlobal);
                if (resultado !== null && resultado !== undefined) {
                    if (resultado.tipo === 'detener' || resultado.tipo === 'continuar') {
                        return resultado;
                    }
                    resultados.push(resultado);
                }
            } catch (error) {
                this.errores.push(error.message);
                console.error(error.message);
            }
        }
        return resultados;
    }

    // Método para recolectar todas las declaraciones de funciones y procedimientos
    recolectarDeclaracionesFunciones(instrucciones, tabla) {
        for (const instruccion of instrucciones) {
            if (instruccion.tipo === 'declaracion_funcion' || instruccion.tipo === 'declaracion_procedimiento') {
                this.declararFuncionProcedimiento(instruccion, tabla);
            }
        }
    }

    // Método auxiliar para declarar funciones y procedimientos sin ejecutar su cuerpo
    declararFuncionProcedimiento(instruccion, tabla) {
        const tipo = instruccion.tipo === 'declaracion_funcion' ? 'funcion' : 'procedimiento';
        const nombre = instruccion.identificador;
        
        // FIX: Si ya existe en el ámbito actual, no volver a declararla
        // (puede ocurrir cuando recolectarDeclaracionesFunciones se llama en ejecutarBloque
        // y luego la fase 2 intenta declararla de nuevo)
        if (tabla.obtenerEnAmbitoActual(nombre)) {
            return;
        }

        // Agregar la función/procedimiento a la tabla de símbolos
        const valor = {
            tipo: 'literal',
            tipoDato: tipo,
            valor: {
                tipoRetorno: instruccion.tipoDato || 'void',
                parametros: instruccion.parametros || [],
                bloque: instruccion.bloque
            }
        };

        tabla.agregar(
            nombre,
            tipo,
            valor,
            instruccion.linea,
            instruccion.columna
        );

        this.funcionesDeclaradas.add(nombre);
    }

    
    ejecutarInstruccion(instruccion, tabla) {
        if (!instruccion) {
            console.warn('Instrucción nula recibida');
            return null;
        }
        
        //console.log('DEBUG - Procesando instrucción:', instruccion.tipo);
        
        switch (instruccion.tipo) {
            case 'declaracion':
                return this.ejecutarDeclaracion(instruccion, tabla);
            case 'declaracion_multiple':
                return this.ejecutarDeclaracionMultiple(instruccion, tabla);
            case 'asignacion':
                return this.ejecutarAsignacion(instruccion, tabla);
            case 'asignacion_vector':
                return this.asignarVector(instruccion, tabla);
            case 'asignacion_atributo':
                return this.asignarAtributo(instruccion, tabla);
            case 'incremento':
                return this.ejecutarIncremento(instruccion, tabla);
            case 'decremento':
                return this.ejecutarDecremento(instruccion, tabla);
            case 'si':
                return this.ejecutarSi(instruccion, tabla);
            case 'mientras':
                return this.ejecutarMientras(instruccion, tabla);
            case 'para':
                return this.ejecutarPara(instruccion, tabla);
            case 'hacer_hasta':
                return this.ejecutarHacerHasta(instruccion, tabla);
            case 'detener':
                return this.ejecutarDetener(instruccion);
            case 'continuar':
                return this.ejecutarContinuar(instruccion);
            case 'declaracion_funcion':
                return this.declararFuncion(instruccion, tabla);
            case 'declaracion_procedimiento':
                return this.declararProcedimiento(instruccion, tabla);
            case 'declaracion_vector':
                return this.declararVector(instruccion, tabla);
            case 'declaracion_objeto':
                return this.declararObjeto(instruccion, tabla);
            case 'declaracion_metodo_objeto':
                return this.declararMetodoObjeto(instruccion, tabla);
            case 'instanciacion_objeto':
                return this.instanciarObjeto(instruccion, tabla);
            case 'llamada':
                return this.ejecutarLlamada(instruccion, tabla);
            case 'llamada_metodo_objeto':
                return this.llamarMetodoObjeto(instruccion, tabla);
            case 'retornar':
                return this.ejecutarRetornar(instruccion, tabla);
            case 'imprimir':
                return this.ejecutarImprimir(instruccion, tabla);
            case 'tolower':
                return this.ejecutarTolower(instruccion, tabla);
            case 'toupper':
                return this.ejecutarToupper(instruccion, tabla);
            case 'error_sintactico':
                // Registrar el error sintáctico y continuar
                this.errores.push(instruccion.mensaje || `Error sintáctico en línea ${instruccion.linea}`);
                return null;

            // CASOS PARA EXPRESIONES QUE PUEDEN APARECER COMO INSTRUCCIONES
            case 'acceso_atributo':
            case 'acceso_vector':
            case 'casteo':
            case 'ternario':
            case 'aritmetica':
            case 'relacional':
            case 'logica':
            case 'unaria':
            case 'literal':
            case 'identificador':
                this.evaluarExpresion(instruccion, tabla);
                return null;

            default:
                console.warn('Tipo de instrucción no manejado:', instruccion.tipo);
                return null;
            }
    }

        // ==================== INCREMENTO Y DECREMENTO ====================

    ejecutarIncremento(instruccion, tabla) {
        const simbolo = tabla.obtener(instruccion.identificador);
        
        if (!simbolo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La variable '${instruccion.identificador}' no ha sido declarada`);
        }

        if (simbolo.tipo !== 'entero' && simbolo.tipo !== 'decimal') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El incremento solo se puede aplicar a variables de tipo entero o decimal`);
        }

        const nuevoValor = {
            tipo: 'literal',
            tipoDato: simbolo.tipo,
            valor: simbolo.valor.valor + 1
        };

        tabla.actualizar(instruccion.identificador, nuevoValor, instruccion.linea, instruccion.columna);
        return null;
    }

    ejecutarDecremento(instruccion, tabla) {
        const simbolo = tabla.obtener(instruccion.identificador);
        
        if (!simbolo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La variable '${instruccion.identificador}' no ha sido declarada`);
        }

        if (simbolo.tipo !== 'entero' && simbolo.tipo !== 'decimal') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El decremento solo se puede aplicar a variables de tipo entero o decimal`);
        }

        const nuevoValor = {
            tipo: 'literal',
            tipoDato: simbolo.tipo,
            valor: simbolo.valor.valor - 1
        };

        tabla.actualizar(instruccion.identificador, nuevoValor, instruccion.linea, instruccion.columna);
        return null;
    }

    // ==================== SENTENCIA SI ====================

    ejecutarSi(instruccion, tabla) {
        const condicion = this.evaluarExpresion(instruccion.condicion, tabla);
        
        if (this.aBooleano(condicion)) {
            // Ejecutar bloque verdadero
            return this.ejecutarBloque(instruccion.bloqueVerdadero, tabla);
        } else if (instruccion.bloqueFalso) {
            // Verificar si hay else-if o else simple
            if (instruccion.bloqueFalso.tipo === 'bloque_else_if') {
                // Procesar lista de o_si
                for (const oSi of instruccion.bloqueFalso.listaOSi) {
                    const condOSi = this.evaluarExpresion(oSi.condicion, tabla);
                    if (this.aBooleano(condOSi)) {
                        return this.ejecutarBloque(oSi.bloque, tabla);
                    }
                }
                // Si ningún o_si se cumplió, ejecutar else final si existe
                if (instruccion.bloqueFalso.bloqueElse) {
                    return this.ejecutarBloque(instruccion.bloqueFalso.bloqueElse, tabla);
                }
            } else {
                // Es un else simple
                return this.ejecutarBloque(instruccion.bloqueFalso, tabla);
            }
        }
        
        return null;
    }

    // ==================== SENTENCIA MIENTRAS ====================

    ejecutarMientras(instruccion, tabla) {
        const estabaEnCiclo = this.enCiclo;
        this.enCiclo = true;

        // FIX: No crear tablaLocal aquí; ejecutarBloque ya crea su propio ámbito.
        // Usar tabla directamente para evaluar la condición.
        try {
            while (true) {
                const condicion = this.evaluarExpresion(instruccion.condicion, tabla);
                
                if (!this.aBooleano(condicion)) {
                    break;
                }

                const resultado = this.ejecutarBloque(instruccion.bloque, tabla);
                
                if (resultado && resultado.tipo === 'detener') {
                    break;
                }
                
                if (resultado && resultado.tipo === 'continuar') {
                    continue;
                }

                if (resultado && resultado.tipo === 'retornar') {
                    return resultado;
                }
            }
        } finally {
            this.enCiclo = estabaEnCiclo;
        }

        return null;
    }

    // ==================== SENTENCIA PARA ====================

    ejecutarPara(instruccion, tabla) {
        // FIX: Crear un único ámbito para todo el ciclo para que la variable
        // de inicialización sea visible en condición, cuerpo y actualización.
        const tablaLocal = new TablaSimbolos(tabla, `Para_${Date.now()}`, 'bloque');
        const estabaEnCiclo = this.enCiclo;
        this.enCiclo = true;

        try {
            // Ejecutar inicialización en el ámbito del ciclo
            this.ejecutarInstruccion(instruccion.inicializacion, tablaLocal);

            while (true) {
                // Evaluar condición
                const condicion = this.evaluarExpresion(instruccion.condicion, tablaLocal);
                
                if (!this.aBooleano(condicion)) {
                    break;
                }

                // Ejecutar bloque (crea su propio sub-ámbito con tablaLocal como padre)
                const resultado = this.ejecutarBloque(instruccion.bloque, tablaLocal);
                
                if (resultado && resultado.tipo === 'detener') {
                    break;
                }

                if (resultado && resultado.tipo === 'retornar') {
                    return resultado;
                }

                // Ejecutar actualización (continuar también ejecuta la actualización)
                this.ejecutarInstruccion(instruccion.actualizacion, tablaLocal);

                if (resultado && resultado.tipo === 'continuar') {
                    continue;
                }
            }
        } finally {
            this.enCiclo = estabaEnCiclo;
        }

        return null;
    }

    // ==================== SENTENCIA HACER HASTA QUE ====================

    ejecutarHacerHasta(instruccion, tabla) {
        const tablaLocal = new TablaSimbolos(tabla);
        const estabaEnCiclo = this.enCiclo;
        this.enCiclo = true;

        try {
            do {
                const resultado = this.ejecutarBloque(instruccion.bloque, tablaLocal);
                
                if (resultado && resultado.tipo === 'detener') {
                    break;
                }
                
                if (resultado && resultado.tipo === 'continuar') {
                    const condicion = this.evaluarExpresion(instruccion.condicion, tablaLocal);
                    if (this.aBooleano(condicion)) {
                        break;
                    }
                    continue;
                }

                const condicion = this.evaluarExpresion(instruccion.condicion, tablaLocal);
                
                if (this.aBooleano(condicion)) {
                    break;
                }
            } while (true);
        } finally {
            this.enCiclo = estabaEnCiclo;
        }

        return null;
    }

    // ==================== DETENER Y CONTINUAR ====================

    ejecutarDetener(instruccion) {
        if (!this.enCiclo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: 'detener' solo puede usarse dentro de un ciclo`);
        }
        return { tipo: 'detener' };
    }

    ejecutarContinuar(instruccion) {
        if (!this.enCiclo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: 'continuar' solo puede usarse dentro de un ciclo`);
        }
        return { tipo: 'continuar' };
    }

    // ==================== EJECUTAR BLOQUE ====================

    ejecutarBloque(instrucciones, tablaPadre) {
        // Crear nuevo ámbito para el bloque con manejo semántico de ámbito léxico
        const tablaLocal = new TablaSimbolos(tablaPadre, `Bloque_${Date.now()}`, 'bloque');

        // FIX: Recolectar funciones/procedimientos declarados en el bloque antes
        // de ejecutar, para permitir referencias hacia adelante (forward references)
        this.recolectarDeclaracionesFunciones(instrucciones, tablaLocal);
        
        for (const instruccion of instrucciones) {
            const resultado = this.ejecutarInstruccion(instruccion, tablaLocal);
            
            // Propagar detener, continuar y retornar
            if (resultado && (resultado.tipo === 'detener' || resultado.tipo === 'continuar' || resultado.tipo === 'retornar')) {
                return resultado;
            }
        }
        return null;
    }

    ejecutarDeclaracion(instruccion, tabla) {
        //console.log('DEBUG: Declarando variable', instruccion.identificador);
        
        let valorEvaluado;
        
        if (instruccion.valor) {
            valorEvaluado = this.evaluarExpresion(instruccion.valor, tabla);
            // Validar compatibilidad de tipos
            this.validarAsignacion(instruccion.tipoDato, valorEvaluado, instruccion.linea, instruccion.columna);
        } else {
            // Valor por defecto
            valorEvaluado = this.obtenerValorDefecto(instruccion.tipoDato);
        }
        
        tabla.agregar(
            instruccion.identificador,
            instruccion.tipoDato,
            valorEvaluado,
            instruccion.linea,
            instruccion.columna
        );
        
        //console.log('DEBUG: Variable declarada:', instruccion.identificador, '=', valorEvaluado);
        return null;
    }

    ejecutarDeclaracionMultiple(instruccion, tabla) {
        //console.log('DEBUG: Declaración múltiple', instruccion.identificadores);
        
        const identificadores = instruccion.identificadores;
        const valores = instruccion.valores;

        if (valores && identificadores.length !== valores.length) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El número de identificadores (${identificadores.length}) no coincide con el número de valores (${valores.length})`);
        }

        for (let i = 0; i < identificadores.length; i++) {
            let valorEvaluado;
            
            if (valores && valores[i]) {
                valorEvaluado = this.evaluarExpresion(valores[i], tabla);
                this.validarAsignacion(instruccion.tipoDato, valorEvaluado, instruccion.linea, instruccion.columna);
            } else {
                valorEvaluado = this.obtenerValorDefecto(instruccion.tipoDato);
            }
            
            tabla.agregar(
                identificadores[i],
                instruccion.tipoDato,
                valorEvaluado,
                instruccion.linea,
                instruccion.columna
            );
            
            //console.log('DEBUG: Variable múltiple declarada:', identificadores[i], '=', valorEvaluado);
        }
        
        return null;
    }

    ejecutarAsignacion(instruccion, tabla) {
        const simbolo = tabla.obtener(instruccion.identificador);
        
        if (!simbolo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La variable '${instruccion.identificador}' no ha sido declarada`);
        }

        const valorEvaluado = this.evaluarExpresion(instruccion.valor, tabla);
        
        // Validar que el tipo sea compatible
        this.validarAsignacion(simbolo.tipo, valorEvaluado, instruccion.linea, instruccion.columna);
        
        tabla.actualizar(instruccion.identificador, valorEvaluado, instruccion.linea, instruccion.columna);
        
        return null;
    }

    evaluarExpresion(expresion, tabla) {
        if (!expresion) {
            throw new Error('Expresión nula o indefinida');
        }
        
        //console.log('DEBUG: Evaluando expresión:', expresion.tipo, expresion);
        
        switch (expresion.tipo) {
            case 'literal':
                return expresion;
            case 'identificador':
                const simbolo = tabla.obtener(expresion.valor);
                if (!simbolo) {

                    //console.log('DEBUG: Tabla actual:', JSON.stringify(tabla.simbolos, null, 2));
                    throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La variable '${expresion.valor}' no ha sido declarada`);
                }
                //console.log('DEBUG: Variable encontrada:', expresion.valor, '=', simbolo.valor);
                return simbolo.valor;
            case 'aritmetica':
                return this.evaluarAritmetica(expresion, tabla);
            case 'relacional':
                return this.evaluarRelacional(expresion, tabla);
            case 'logica':
                return this.evaluarLogica(expresion, tabla);
            case 'unaria':
                return this.evaluarUnaria(expresion, tabla);
            case 'ternario':
                return this.evaluarTernario(expresion, tabla);
            case 'casteo':
                return this.evaluarCasteo(expresion, tabla);
            case 'llamada':
                return this.evaluarLlamada(expresion, tabla);
            case 'llamada_metodo_objeto':
                return this.llamarMetodoObjeto(expresion, tabla);
            case 'acceso_vector':
                return this.evaluarAccesoVector(expresion, tabla);
            case 'acceso_atributo':
                return this.evaluarAccesoAtributo(expresion, tabla);
            case 'tolower_expr':
                return this.evaluarTolowerExpr(expresion, tabla);
            case 'toupper_expr':
                return this.evaluarToupperExpr(expresion, tabla);
            default:
                throw new Error(`Expresión desconocida: ${expresion.tipo}`);
        }
    }

    evaluarAritmetica(expresion, tabla) {
        const izq = this.evaluarExpresion(expresion.izq, tabla);
        const der = this.evaluarExpresion(expresion.der, tabla);
        const op = expresion.operador;

        // Tabla de tipos resultantes según la especificación
        const tipoResultado = this.obtenerTipoAritmetico(izq.tipoDato, der.tipoDato, op, expresion.linea, expresion.columna);

        // FIX: Convertir booleanos a 0/1 y caracteres a código ASCII antes de operar
        const valIzq = this.aNumero(izq);
        const valDer = this.aNumero(der);

        let resultado;

        switch (op) {
            case '+':
                if (tipoResultado === 'cadena') {
                    resultado = this.convertirACadena(izq) + this.convertirACadena(der);
                } else {
                    resultado = valIzq + valDer;
                }
                break;
            case '-':
                resultado = valIzq - valDer;
                break;
            case '*':
                resultado = valIzq * valDer;
                break;
            case '/':
                if (valDer === 0) {
                    throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: División por cero`);
                }
                resultado = valIzq / valDer;
                break;
            case '^':
                resultado = Math.pow(valIzq, valDer);
                break;
            case '%':
                if (valDer === 0) {
                    throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: Módulo por cero`);
                }
                resultado = valIzq % valDer;
                break;
        }

        // FIX: Asegurar tipo correcto en el resultado (entero → truncar, decimal → flotante)
        if (tipoResultado === 'entero' && typeof resultado === 'number') {
            resultado = Math.trunc(resultado);
        }

        return {
            tipo: 'literal',
            tipoDato: tipoResultado,
            valor: resultado
        };
    }

    // FIX: Helper para convertir cualquier valor a número para operaciones aritméticas
    aNumero(valor) {
        if (valor.tipoDato === 'booleano') {
            return valor.valor ? 1 : 0;
        }
        if (valor.tipoDato === 'caracter') {
            return valor.valor.charCodeAt(0);
        }
        return valor.valor;
    }

    evaluarRelacional(expresion, tabla) {
        const izq = this.evaluarExpresion(expresion.izq, tabla);
        const der = this.evaluarExpresion(expresion.der, tabla);
        const op = expresion.operador;

        // Validar que los tipos sean compatibles para comparación
        this.validarComparacion(izq.tipoDato, der.tipoDato, expresion.linea, expresion.columna);

        let resultado;

        switch (op) {
            case '==':
                resultado = izq.valor === der.valor;
                break;
            case '!=':
                resultado = izq.valor !== der.valor;
                break;
            case '<':
                resultado = izq.valor < der.valor;
                break;
            case '<=':
                resultado = izq.valor <= der.valor;
                break;
            case '>':
                resultado = izq.valor > der.valor;
                break;
            case '>=':
                resultado = izq.valor >= der.valor;
                break;
        }

        return {
            tipo: 'literal',
            tipoDato: 'booleano',
            valor: resultado
        };
    }

    evaluarLogica(expresion, tabla) {
        const op = expresion.operador;

        if (op === '!') {
            const exp = this.evaluarExpresion(expresion.expresion, tabla);
            return {
                tipo: 'literal',
                tipoDato: 'booleano',
                valor: !this.aBooleano(exp)
            };
        }

        const izq = this.evaluarExpresion(expresion.izq, tabla);
        const der = this.evaluarExpresion(expresion.der, tabla);

        let resultado;

        switch (op) {
            case '||':
                resultado = this.aBooleano(izq) || this.aBooleano(der);
                break;
            case '&&':
                resultado = this.aBooleano(izq) && this.aBooleano(der);
                break;
        }

        return {
            tipo: 'literal',
            tipoDato: 'booleano',
            valor: resultado
        };
    }

    evaluarUnaria(expresion, tabla) {
        const exp = this.evaluarExpresion(expresion.expresion, tabla);

        if (exp.tipoDato !== 'entero' && exp.tipoDato !== 'decimal') {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La negación unaria solo acepta enteros o decimales`);
        }

        return {
            tipo: 'literal',
            tipoDato: exp.tipoDato,
            valor: -exp.valor
        };
    }

    evaluarTernario(expresion, tabla) {
        const condicion = this.evaluarExpresion(expresion.condicion, tabla);
        
        if (this.aBooleano(condicion)) {
            return this.evaluarExpresion(expresion.verdadero, tabla);
        } else {
            return this.evaluarExpresion(expresion.falso, tabla);
        }
    }

    // ==================== FUNCIONES DE VALIDACIÓN ====================

    obtenerTipoAritmetico(tipo1, tipo2, operador, linea, columna) {
        // Tablas de tipos según la especificación del proyecto
        
        if (operador === '+') {
            const tablaSuma = {
                'entero': { 'entero': 'entero', 'decimal': 'decimal', 'booleano': 'entero', 'caracter': 'entero', 'cadena': 'cadena' },
                'decimal': { 'entero': 'decimal', 'decimal': 'decimal', 'booleano': 'decimal', 'caracter': 'decimal', 'cadena': 'cadena' },
                'booleano': { 'entero': 'entero', 'decimal': 'decimal', 'cadena': 'cadena' },
                'caracter': { 'entero': 'entero', 'decimal': 'decimal', 'cadena': 'cadena', 'caracter': 'cadena' },
                'cadena': { 'entero': 'cadena', 'decimal': 'cadena', 'booleano': 'cadena', 'caracter': 'cadena', 'cadena': 'cadena' }
            };
            if (tablaSuma[tipo1] && tablaSuma[tipo1][tipo2]) {
                return tablaSuma[tipo1][tipo2];
            }
        } else if (operador === '-') {
            const tablaResta = {
                'entero': { 'entero': 'entero', 'decimal': 'decimal', 'booleano': 'entero', 'caracter': 'entero' },
                'decimal': { 'entero': 'decimal', 'decimal': 'decimal', 'booleano': 'decimal', 'caracter': 'decimal' },
                'booleano': { 'entero': 'entero', 'decimal': 'decimal' },
                'caracter': { 'entero': 'entero', 'decimal': 'decimal' }
            };
            if (tablaResta[tipo1] && tablaResta[tipo1][tipo2]) {
                return tablaResta[tipo1][tipo2];
            }
        } else if (operador === '*') {
            const tablaMultiplicacion = {
                'entero': { 'entero': 'entero', 'decimal': 'decimal', 'caracter': 'entero' },
                'decimal': { 'entero': 'decimal', 'decimal': 'decimal', 'caracter': 'decimal' },
                'caracter': { 'entero': 'entero', 'decimal': 'decimal' }
            };
            if (tablaMultiplicacion[tipo1] && tablaMultiplicacion[tipo1][tipo2]) {
                return tablaMultiplicacion[tipo1][tipo2];
            }
        } else if (operador === '/') {
            const tablaDivision = {
                'entero': { 'entero': 'decimal', 'decimal': 'decimal', 'caracter': 'decimal' },
                'decimal': { 'entero': 'decimal', 'decimal': 'decimal', 'caracter': 'decimal' },
                'caracter': { 'entero': 'decimal', 'decimal': 'decimal' }
            };
            if (tablaDivision[tipo1] && tablaDivision[tipo1][tipo2]) {
                return tablaDivision[tipo1][tipo2];
            }
        } else if (operador === '^') {
            const tablaPotencia = {
                'entero': { 'entero': 'entero', 'decimal': 'decimal' },
                'decimal': { 'entero': 'decimal', 'decimal': 'decimal' }
            };
            if (tablaPotencia[tipo1] && tablaPotencia[tipo1][tipo2]) {
                return tablaPotencia[tipo1][tipo2];
            }
        } else if (operador === '%') {
            // FIX: Según el PDF, el módulo SIEMPRE retorna Decimal:
            // % | Entero  | Decimal
            // Entero  | Decimal | Decimal
            // Decimal | Decimal | Decimal
            const tablaModulo = {
                'entero':  { 'entero': 'decimal', 'decimal': 'decimal' },
                'decimal': { 'entero': 'decimal', 'decimal': 'decimal' }
            };
            if (tablaModulo[tipo1] && tablaModulo[tipo1][tipo2]) {
                return tablaModulo[tipo1][tipo2];
            }
        }

        throw new Error(`Error semántico [${linea}:${columna}]: Operación ${operador} no válida entre ${tipo1} y ${tipo2}`);
    }
    
    validarComparacion(tipo1, tipo2, linea, columna) {
        const tiposValidos = ['entero', 'decimal', 'booleano', 'caracter', 'cadena'];
        
        if (!tiposValidos.includes(tipo1) || !tiposValidos.includes(tipo2)) {
            throw new Error(`Error semántico [${linea}:${columna}]: Tipos no válidos para comparación: ${tipo1} y ${tipo2}`);
        }
        
        return true;
    }

    validarAsignacion(tipoDato, valorEvaluado, linea, columna) {
        if (!valorEvaluado) {
            throw new Error(`Error semántico [${linea}:${columna}]: Valor de asignación nulo o indefinido`);
        }
        
        // Permitir asignación de void para valores por defecto
        if (valorEvaluado.tipoDato === 'void') {
            return true;
        }
        
        // Si los tipos son iguales, siempre es válido
        if (tipoDato === valorEvaluado.tipoDato) {
            return true;
        }

        // FIX: Solo se permite conversión implícita de entero -> decimal (widening).
        // Asignar decimal a entero requiere casteo explícito según el PDF.
        const conversionesPermitidas = {
            'decimal': ['entero'],  // una variable decimal puede recibir un entero implícitamente
        };
        
        if (conversionesPermitidas[tipoDato] && conversionesPermitidas[tipoDato].includes(valorEvaluado.tipoDato)) {
            return true;
        }

        throw new Error(`Error semántico [${linea}:${columna}]: No se puede asignar un valor de tipo '${valorEvaluado.tipoDato}' a una variable de tipo '${tipoDato}'`);
    }

    // ==================== FUNCIONES DE CONVERSIÓN ====================

    convertirACadena(valor) {
        if (valor.tipoDato === 'cadena') {
            return valor.valor;
        }
        if (valor.tipoDato === 'booleano') {
            return valor.valor ? 'Verdadero' : 'Falso';
        }
        if (valor.tipoDato === 'caracter') {
            return valor.valor;
        }
        return String(valor.valor);
    }

    aBooleano(valor) {
        if (valor.tipoDato === 'booleano') {
            return valor.valor;
        }
        if (valor.tipoDato === 'entero') {
            return valor.valor !== 0;
        }
        if (valor.tipoDato === 'cadena') {
            return valor.valor.length > 0;
        }
        return Boolean(valor.valor);
    }

    // ==================== IMPRIMIR ====================

    ejecutarImprimir(instruccion, tabla) {
        const valor = this.evaluarExpresion(instruccion.expresion, tabla);
        let texto = this.convertirACadena(valor);
        
        if (instruccion.saltoLinea) {
            texto += '\n';
        }
        
        // FIX: Agregar a salida sin usar process.stdout.write (incompatible con browser)
        this.salida.push(texto);
        
        return null;
    }

    // ==================== TOLOWER ====================

    ejecutarTolower(instruccion, tabla) {
        const valor = this.evaluarExpresion(instruccion.expresion, tabla);
        
        if (valor.tipoDato !== 'cadena') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La función 'tolower' solo acepta cadenas`);
        }
        
        const resultado = valor.valor.toLowerCase();
        this.salida.push(resultado);
        console.log(resultado);
        
        return null;
    }

    evaluarTolowerExpr(expresion, tabla) {
        const valor = this.evaluarExpresion(expresion.expresion, tabla);
        
        if (valor.tipoDato !== 'cadena') {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La función 'tolower' solo acepta cadenas`);
        }
        
        return {
            tipo: 'literal',
            tipoDato: 'cadena',
            valor: valor.valor.toLowerCase()
        };
    }

    // ==================== TOUPPER ====================

    ejecutarToupper(instruccion, tabla) {
        const valor = this.evaluarExpresion(instruccion.expresion, tabla);
        
        if (valor.tipoDato !== 'cadena') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La función 'toupper' solo acepta cadenas`);
        }
        
        const resultado = valor.valor.toUpperCase();
        this.salida.push(resultado);
        console.log(resultado);
        
        return null;
    }

    evaluarToupperExpr(expresion, tabla) {
        const valor = this.evaluarExpresion(expresion.expresion, tabla);
        
        if (valor.tipoDato !== 'cadena') {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La función 'toupper' solo acepta cadenas`);
        }
        
        return {
            tipo: 'literal',
            tipoDato: 'cadena',
            valor: valor.valor.toUpperCase()
        };
    }

    // ==================== VECTORES ====================

    declararVector(instruccion, tabla) {
        if (tabla.obtener(instruccion.identificador)) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La variable '${instruccion.identificador}' ya fue declarada`);
        }

        let valores;

        if (instruccion.valores !== null) {
            // Tipo 2: con valores
            if (instruccion.dimension === 1) {
                valores = instruccion.valores.map(v => this.evaluarExpresion(v, tabla));
                
                // Validar tipos
                for (const val of valores) {
                    if (val.tipoDato !== instruccion.tipoDato) {
                        throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Todos los elementos deben ser de tipo '${instruccion.tipoDato}'`);
                    }
                }
            } else {
                // 2D
                valores = [];
                for (const fila of instruccion.valores) {
                    const filaEvaluada = fila.map(v => this.evaluarExpresion(v, tabla));
                    
                    for (const val of filaEvaluada) {
                        if (val.tipoDato !== instruccion.tipoDato) {
                            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Todos los elementos deben ser de tipo '${instruccion.tipoDato}'`);
                        }
                    }
                    
                    valores.push(filaEvaluada);
                }
            }
        } else {
            // Tipo 1: con tamaño
            const tamanio1Val = this.evaluarExpresion(instruccion.tamanio1, tabla);
            
            if (tamanio1Val.tipoDato !== 'entero' || tamanio1Val.valor < 0) {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El tamaño del vector debe ser un entero positivo`);
            }

            const valorDefault = this.obtenerValorDefecto(instruccion.tipoDato);

            if (instruccion.dimension === 1) {
                valores = Array(tamanio1Val.valor).fill(null).map(() => ({ ...valorDefault }));
            } else {
                const tamanio2Val = this.evaluarExpresion(instruccion.tamanio2, tabla);
                
                if (tamanio2Val.tipoDato !== 'entero' || tamanio2Val.valor < 0) {
                    throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El tamaño del vector debe ser un entero positivo`);
                }

                valores = Array(tamanio1Val.valor).fill(null).map(() =>
                    Array(tamanio2Val.valor).fill(null).map(() => ({ ...valorDefault }))
                );
            }
        }

        tabla.agregar(
            instruccion.identificador,
            `vector_${instruccion.dimension}d_${instruccion.tipoDato}`,
            {
                tipo: 'literal',
                tipoDato: `vector_${instruccion.dimension}d_${instruccion.tipoDato}`,
                valor: valores,
                dimension: instruccion.dimension,
                tipoElemento: instruccion.tipoDato
            },
            instruccion.linea,
            instruccion.columna
        );

        return null;
    }

    evaluarAccesoVector(expresion, tabla) {
        const simbolo = tabla.obtener(expresion.identificador);

        if (!simbolo) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: El vector '${expresion.identificador}' no ha sido declarado`);
        }

        if (!simbolo.tipo.startsWith('vector_')) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: '${expresion.identificador}' no es un vector`);
        }

        const indice1Val = this.evaluarExpresion(expresion.indice1, tabla);

        if (indice1Val.tipoDato !== 'entero') {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: Los índices deben ser enteros`);
        }

        if (simbolo.valor.dimension === 1) {
            if (expresion.indice2 !== null) {
                throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: El vector es de una dimensión`);
            }

            if (indice1Val.valor < 0 || indice1Val.valor >= simbolo.valor.valor.length) {
                throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: Índice fuera de rango`);
            }

            return simbolo.valor.valor[indice1Val.valor];
        } else {
            if (expresion.indice2 === null) {
                throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: El vector es de dos dimensiones`);
            }

            const indice2Val = this.evaluarExpresion(expresion.indice2, tabla);

            if (indice2Val.tipoDato !== 'entero') {
                throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: Los índices deben ser enteros`);
            }

            if (indice1Val.valor < 0 || indice1Val.valor >= simbolo.valor.valor.length) {
                throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: Índice 1 fuera de rango`);
            }

            if (indice2Val.valor < 0 || indice2Val.valor >= simbolo.valor.valor[indice1Val.valor].length) {
                throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: Índice 2 fuera de rango`);
            }

            return simbolo.valor.valor[indice1Val.valor][indice2Val.valor];
        }
    }

    asignarVector(instruccion, tabla) {
        const simbolo = tabla.obtener(instruccion.identificador);

        if (!simbolo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El vector '${instruccion.identificador}' no ha sido declarado`);
        }

        if (!simbolo.tipo.startsWith('vector_')) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: '${instruccion.identificador}' no es un vector`);
        }

        const valor = this.evaluarExpresion(instruccion.valor, tabla);
        const indice1Val = this.evaluarExpresion(instruccion.indice1, tabla);

        if (indice1Val.tipoDato !== 'entero') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Los índices deben ser enteros`);
        }

        if (valor.tipoDato !== simbolo.valor.tipoElemento) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El valor debe ser de tipo '${simbolo.valor.tipoElemento}'`);
        }

        if (simbolo.valor.dimension === 1) {
            if (instruccion.indice2 !== null) {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El vector es de una dimensión`);
            }

            if (indice1Val.valor < 0 || indice1Val.valor >= simbolo.valor.valor.length) {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Índice fuera de rango`);
            }

            simbolo.valor.valor[indice1Val.valor] = valor;
        } else {
            if (instruccion.indice2 === null) {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El vector es de dos dimensiones`);
            }

            const indice2Val = this.evaluarExpresion(instruccion.indice2, tabla);

            if (indice2Val.tipoDato !== 'entero') {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Los índices deben ser enteros`);
            }

            if (indice1Val.valor < 0 || indice1Val.valor >= simbolo.valor.valor.length) {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Índice 1 fuera de rango`);
            }

            if (indice2Val.valor < 0 || indice2Val.valor >= simbolo.valor.valor[indice1Val.valor].length) {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Índice 2 fuera de rango`);
            }

            simbolo.valor.valor[indice1Val.valor][indice2Val.valor] = valor;
        }

        return null;
    }

    // ==================== OBJETOS ====================

    declararObjeto(instruccion, tabla) {
        if (tabla.obtener(instruccion.identificador)) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El objeto '${instruccion.identificador}' ya fue declarado`);
        }

        tabla.agregar(
            instruccion.identificador,
            'tipo_objeto',
            {
                tipo: 'literal',
                tipoDato: 'tipo_objeto',
                valor: {
                    atributos: instruccion.atributos,
                    metodos: {}
                }
            },
            instruccion.linea,
            instruccion.columna
        );

        return null;
    }

    declararMetodoObjeto(instruccion, tabla) {
        //console.log('DEBUG: Declarando método', instruccion.nombreMetodo, 'para objeto', instruccion.nombreObjeto);
        
        const objetoTipo = tabla.obtener(instruccion.nombreObjeto);

        if (!objetoTipo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El objeto '${instruccion.nombreObjeto}' no ha sido declarado`);
        }

        if (objetoTipo.tipo !== 'tipo_objeto') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: '${instruccion.nombreObjeto}' no es un tipo de objeto`);
        }

        // Inicializar metodos si no existen
        if (!objetoTipo.valor.valor.metodos) {
            objetoTipo.valor.valor.metodos = {};
        }

        if (objetoTipo.valor.valor.metodos[instruccion.nombreMetodo]) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El método '${instruccion.nombreMetodo}' ya fue declarado en el objeto '${instruccion.nombreObjeto}'`);
        }

        objetoTipo.valor.valor.metodos[instruccion.nombreMetodo] = {
            parametros: instruccion.parametros,
            bloque: instruccion.bloque
        };

        //console.log('DEBUG: Método declarado exitosamente');
        return null;
    }

    instanciarObjeto(instruccion, tabla) {
        //console.log('DEBUG: Instanciando objeto', instruccion);
        
        const objetoTipo = tabla.obtener(instruccion.nombreObjeto);

        if (!objetoTipo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El objeto '${instruccion.nombreObjeto}' no ha sido declarado`);
        }

        if (objetoTipo.tipo !== 'tipo_objeto') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: '${instruccion.nombreObjeto}' no es un tipo de objeto`);
        }

        const atributos = objetoTipo.valor.valor.atributos;
        const valores = instruccion.valores;

        if (valores.length !== atributos.length) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Se esperaban ${atributos.length} valores para instanciar '${instruccion.nombreObjeto}', se proporcionaron ${valores.length}`);
        }

        const instancia = {
            tipoObjeto: instruccion.nombreObjeto,
            atributos: {},
            metodos: objetoTipo.valor.valor.metodos || {}
        };

        // Evaluar y asignar valores a los atributos
        for (let i = 0; i < atributos.length; i++) {
            const atributo = atributos[i];
            const valor = this.evaluarExpresion(valores[i], tabla);

            if (valor.tipoDato !== atributo.tipo) {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El atributo '${atributo.identificador}' debe ser de tipo '${atributo.tipo}', se recibió '${valor.tipoDato}'`);
            }

            instancia.atributos[atributo.identificador] = {
                tipo: atributo.tipo,
                valor: valor
            };
        }

        // Guardar la instancia en la tabla de símbolos
        tabla.agregar(
            instruccion.identificador,
            'instancia_objeto',
            {
                tipo: 'literal',
                tipoDato: 'instancia_objeto',
                valor: instancia
            },
            instruccion.linea,
            instruccion.columna
        );

        //console.log('DEBUG: Objeto instanciado exitosamente', instruccion.identificador);
        return null;
    }

    evaluarAccesoAtributo(expresion, tabla) {
        const instancia = tabla.obtener(expresion.instancia);

        if (!instancia) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La instancia '${expresion.instancia}' no ha sido declarada`);
        }

        if (instancia.tipo !== 'instancia_objeto') {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: '${expresion.instancia}' no es una instancia de objeto`);
        }

        if (!instancia.valor.valor.atributos[expresion.atributo]) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: El atributo '${expresion.atributo}' no existe en la instancia`);
        }

        return instancia.valor.valor.atributos[expresion.atributo].valor;
    }

    asignarAtributo(instruccion, tabla) {
        const instancia = tabla.obtener(instruccion.instancia);

        if (!instancia) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La instancia '${instruccion.instancia}' no ha sido declarada`);
        }

        if (instancia.tipo !== 'instancia_objeto') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: '${instruccion.instancia}' no es una instancia de objeto`);
        }

        if (!instancia.valor.valor.atributos[instruccion.atributo]) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El atributo '${instruccion.atributo}' no existe en la instancia`);
        }

        const valor = this.evaluarExpresion(instruccion.valor, tabla);
        const tipoEsperado = instancia.valor.valor.atributos[instruccion.atributo].tipo;

        if (valor.tipoDato !== tipoEsperado) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El atributo '${instruccion.atributo}' debe ser de tipo '${tipoEsperado}'`);
        }

        instancia.valor.valor.atributos[instruccion.atributo].valor = valor;

        return null;
    }
    
    llamarMetodoObjeto(instruccion, tabla) {
        //console.log('DEBUG: Llamando método', instruccion.metodo, 'de', instruccion.instancia);
        
        const instancia = tabla.obtener(instruccion.instancia);

        if (!instancia) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: La instancia '${instruccion.instancia}' no ha sido declarada`);
        }

        if (instancia.tipo !== 'instancia_objeto') {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: '${instruccion.instancia}' no es una instancia de objeto`);
        }

        const metodo = instancia.valor.valor.metodos[instruccion.metodo];

        if (!metodo) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El método '${instruccion.metodo}' no existe en la instancia`);
        }

        const parametros = metodo.parametros;
        const argumentos = instruccion.argumentos;

        // Validar número de argumentos
        const parametrosRequeridos = parametros.filter(p => p.valorDefecto === null).length;
        
        if (argumentos.length < parametrosRequeridos) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El método '${instruccion.metodo}' requiere al menos ${parametrosRequeridos} argumentos`);
        }

        if (argumentos.length > parametros.length) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El método '${instruccion.metodo}' acepta máximo ${parametros.length} argumentos`);
        }

        // Crear tabla local con acceso a los atributos del objeto
        const tablaLocal = new TablaSimbolos(tabla);

        for (const [nombreAtributo, atributo] of Object.entries(instancia.valor.valor.atributos)) {
            tablaLocal.agregar(
                nombreAtributo,
                atributo.tipo,
                atributo.valor,
                instruccion.linea,
                instruccion.columna
            );
        }

        // Agregar parámetros del método
        for (let i = 0; i < parametros.length; i++) {
            const parametro = parametros[i];
            let valor;

            if (i < argumentos.length) {
                valor = this.evaluarExpresion(argumentos[i], tabla);
                
                if (valor.tipoDato !== parametro.tipo) {
                    throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: El argumento ${i + 1} debe ser de tipo '${parametro.tipo}'`);
                }
            } else if (parametro.valorDefecto !== null) {
                valor = this.evaluarExpresion(parametro.valorDefecto, tabla);
            } else {
                throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: Falta el argumento requerido '${parametro.identificador}'`);
            }

            tablaLocal.agregar(
                parametro.identificador,
                parametro.tipo,
                valor,
                parametro.linea,
                parametro.columna
            );
        }

        // Ejecutar el bloque del método
        const estabaEnFuncion = this.enFuncion;
        this.enFuncion = true;
        this.valorRetorno = null;

        // FIX: guardar valorRetorno en variable local antes del finally
        let valorRetornoLocal = null;

        try {
            for (const instruccionMetodo of metodo.bloque) {
                const resultado = this.ejecutarInstruccion(instruccionMetodo, tablaLocal);
                
                // Si hay retorno, salir
                if (resultado && resultado.tipo === 'retornar') {
                    break;
                }
                
                // Propagar detener y continuar
                if (resultado && (resultado.tipo === 'detener' || resultado.tipo === 'continuar')) {
                    return resultado;
                }
            }

            valorRetornoLocal = this.valorRetorno;

            // Actualizar atributos del objeto con los valores modificados
            for (const [nombreAtributo] of Object.entries(instancia.valor.valor.atributos)) {
                const simboloAtributo = tablaLocal.obtenerEnAmbitoActual(nombreAtributo);
                if (simboloAtributo && simboloAtributo.tipo !== 'funcion' && simboloAtributo.tipo !== 'procedimiento') {
                    instancia.valor.valor.atributos[nombreAtributo].valor = simboloAtributo.valor;
                }
            }

            // Retornar el valor de retorno del método
            if (valorRetornoLocal !== null) {
                return valorRetornoLocal;
            }

            // Si no hay retorno explícito, retornar void
            return { tipo: 'literal', tipoDato: 'void', valor: null };

        } finally {
            this.enFuncion = estabaEnFuncion;
            this.valorRetorno = null;
        }
    }
    
    // ==================== CASTEOS ====================

    evaluarCasteo(expresion, tabla) {
        const valorOriginal = this.evaluarExpresion(expresion.expresion, tabla);
        const tipoCasteo = expresion.tipoCasteo;
        const tipoOriginal = valorOriginal.tipoDato;

        // Validar que el casteo sea permitido
        if (!this.esCasteoValido(tipoOriginal, tipoCasteo)) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: No se puede castear de '${tipoOriginal}' a '${tipoCasteo}'`);
        }

        const valorCasteado = this.realizarCasteo(valorOriginal.valor, tipoOriginal, tipoCasteo);

        return {
            tipo: 'literal',
            tipoDato: tipoCasteo,
            valor: valorCasteado
        };
    }

    esCasteoValido(tipoOrigen, tipoDestino) {
        // Permitir casteo al mismo tipo (puede ser útil en algunos casos)
        if (tipoOrigen === tipoDestino) {
            return true;
        }
        
        const casteosPermitidos = {
            'entero': ['decimal', 'cadena', 'caracter'],
            'decimal': ['entero', 'cadena'],
            'caracter': ['entero', 'decimal'],
            'cadena': [],
            'booleano': []
        };

        return casteosPermitidos[tipoOrigen]?.includes(tipoDestino) || false;
    }

    realizarCasteo(valor, tipoOrigen, tipoDestino) {
        // Entero -> Decimal
        if (tipoOrigen === 'entero' && tipoDestino === 'decimal') {
            return parseFloat(valor);
        }
        
        // Decimal -> Entero
        if (tipoOrigen === 'decimal' && tipoDestino === 'entero') {
            return Math.trunc(valor);
        }
        
        // Entero -> Cadena
        if (tipoOrigen === 'entero' && tipoDestino === 'cadena') {
            return String(valor);
        }
        
        // Entero -> Caracter (código ASCII)
        if (tipoOrigen === 'entero' && tipoDestino === 'caracter') {
            return String.fromCharCode(valor);
        }
        
        // Decimal -> Cadena
        if (tipoOrigen === 'decimal' && tipoDestino === 'cadena') {
            return String(valor);
        }
        
        // Caracter -> Entero (código ASCII)
        if (tipoOrigen === 'caracter' && tipoDestino === 'entero') {
            return valor.charCodeAt(0);
        }
        
        // Caracter -> Decimal (código ASCII)
        if (tipoOrigen === 'caracter' && tipoDestino === 'decimal') {
            return parseFloat(valor.charCodeAt(0));
        }

        return valor;
    }

    // ==================== FUNCIONES Y PROCEDIMIENTOS ====================

    declararFuncion(instruccion, tabla) {
        // FIX: Si ya existe en cualquier ámbito (fue pre-registrada en fase 1 o por ejecutarBloque),
        // no hacer nada. Solo lanzar error si definitivamente no existe.
        if (tabla.obtener(instruccion.identificador)) {
            return null; // ya declarada, no-op
        }
        // Si llegamos aquí, intentar declararla ahora
        this.declararFuncionProcedimiento(instruccion, tabla);
        return null;
    }

    declararProcedimiento(instruccion, tabla) {
        // FIX: Mismo comportamiento que declararFuncion
        if (tabla.obtener(instruccion.identificador)) {
            return null; // ya declarada, no-op
        }
        this.declararFuncionProcedimiento(instruccion, tabla);
        return null;
    }

    ejecutarLlamada(instruccion, tabla) {
        this.evaluarLlamada(instruccion, tabla);
        return null;
    }

    evaluarLlamada(expresion, tabla) {
        const simbolo = tabla.obtener(expresion.identificador);

        if (!simbolo) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La función/procedimiento '${expresion.identificador}' no ha sido declarada`);
        }

        const definicion = simbolo.valor.valor;
        const parametros = definicion.parametros;
        const argumentos = expresion.argumentos;

        // Validar número de argumentos
        const parametrosRequeridos = parametros.filter(p => p.valorDefecto === null).length;
        
        if (argumentos.length < parametrosRequeridos) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: '${expresion.identificador}' requiere al menos ${parametrosRequeridos} argumentos, se proporcionaron ${argumentos.length}`);
        }

        if (argumentos.length > parametros.length) {
            throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: '${expresion.identificador}' acepta máximo ${parametros.length} argumentos, se proporcionaron ${argumentos.length}`);
        }

        // Crear nuevo ámbito para la función con manejo semántico de ámbito léxico
        const tipoAmbito = simbolo.tipo === 'funcion' ? 'funcion' : 'procedimiento';
        const tablaLocal = new TablaSimbolos(tabla, `${tipoAmbito}_${expresion.identificador}`, tipoAmbito);

        // Agregar parámetros al ámbito local
        for (let i = 0; i < parametros.length; i++) {
            const parametro = parametros[i];
            let valor;

            if (i < argumentos.length) {
                valor = this.evaluarExpresion(argumentos[i], tabla);
                
                if (valor.tipoDato !== parametro.tipo) {
                    throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: El argumento ${i + 1} debe ser de tipo '${parametro.tipo}', se recibió '${valor.tipoDato}'`);
                }
            } else if (parametro.valorDefecto !== null) {
                valor = this.evaluarExpresion(parametro.valorDefecto, tabla);
            } else {
                throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: Falta el argumento requerido '${parametro.identificador}'`);
            }

            tablaLocal.agregar(
                parametro.identificador,
                parametro.tipo,
                valor,
                parametro.linea,
                parametro.columna
            );
        }

        // Ejecutar el bloque de la función
        const estabaEnFuncion = this.enFuncion;
        this.enFuncion = true;
        this.valorRetorno = null;

        // FIX: guardar valorRetorno en variable local antes del finally, ya que
        // el finally lo pone a null antes de que pueda ser retornado.
        let valorRetornoLocal = null;

        try {
            for (const instruccion of definicion.bloque) {
                const resultado = this.ejecutarInstruccion(instruccion, tablaLocal);
                
                // Si hay retorno, salir
                if (resultado && resultado.tipo === 'retornar') {
                    break;
                }
                
                // Propagar detener y continuar
                if (resultado && (resultado.tipo === 'detener' || resultado.tipo === 'continuar')) {
                    return resultado;
                }
            }

            valorRetornoLocal = this.valorRetorno;

            // Validar retorno para funciones
            if (simbolo.tipo === 'funcion') {
                if (valorRetornoLocal === null) {
                    throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La función '${expresion.identificador}' debe retornar un valor de tipo '${definicion.tipoRetorno}'`);
                }

                // Validar tipo de retorno
                if (valorRetornoLocal.tipoDato !== definicion.tipoRetorno) {
                    throw new Error(`Error semántico [${expresion.linea}:${expresion.columna}]: La función '${expresion.identificador}' debe retornar '${definicion.tipoRetorno}', se retornó '${valorRetornoLocal.tipoDato}'`);
                }

                return valorRetornoLocal;
            }

            // Procedimientos no retornan valor
            return { tipo: 'literal', tipoDato: 'void', valor: null };

        } finally {
            this.enFuncion = estabaEnFuncion;
            this.valorRetorno = null;
        }
    }

    ejecutarRetornar(instruccion, tabla) {
        if (!this.enFuncion) {
            throw new Error(`Error semántico [${instruccion.linea}:${instruccion.columna}]: 'retornar' solo puede usarse dentro de una función o procedimiento`);
        }

        if (instruccion.expresion !== null) {
            this.valorRetorno = this.evaluarExpresion(instruccion.expresion, tabla);
        }

        return { tipo: 'retornar' };
    }

    obtenerValorDefecto(tipo) {
        switch(tipo) {
            case 'entero': return { tipo: 'literal', tipoDato: 'entero', valor: 0 };
            case 'decimal': return { tipo: 'literal', tipoDato: 'decimal', valor: 0.0 };
            case 'booleano': return { tipo: 'literal', tipoDato: 'booleano', valor: true }; 
            case 'caracter': return { tipo: 'literal', tipoDato: 'caracter', valor: '\u0000' };
            case 'cadena': return { tipo: 'literal', tipoDato: 'cadena', valor: '' };
            default: return { tipo: 'literal', tipoDato: 'entero', valor: 0 };
        }
    }

    // ==================== REPORTES ====================

    obtenerTablaSimbolos() {
        // FIX: Recorrer toda la jerarquía de tablas para incluir todas las variables
        const simbolos = [];
        this.recolectarSimbolosRecursivo(this.tablaGlobal, simbolos);
        // Renumerar IDs de forma global y consecutiva
        simbolos.forEach((s, i) => { s.id = i + 1; });
        return simbolos;
    }

    recolectarSimbolosRecursivo(tabla, resultado) {
        for (const [nombre, info] of Object.entries(tabla.simbolos)) {
            resultado.push({
                id: 0, // se renumera después
                nombre: nombre,
                tipo: info.tipo === 'funcion' ? 'Función' :
                      info.tipo === 'procedimiento' ? 'Procedimiento' :
                      info.tipo === 'tipo_objeto' ? 'Tipo Objeto' :
                      info.tipo === 'instancia_objeto' ? 'Instancia' :
                      info.tipo.startsWith('vector_') ? 'Vector' : 'Variable',
                tipoDato: info.tipo,
                entorno: tabla.nombre,
                valor: this.valorParaReporte(info.valor),
                linea: info.linea,
                columna: info.columna
            });
        }
        // FIX: Recorrer tablas hijas para incluir variables de ámbitos anidados
        for (const hijo of tabla.hijos) {
            this.recolectarSimbolosRecursivo(hijo, resultado);
        }
    }

    obtenerSimbolosDeTabla(tabla, entorno) {
        // Mantenido por compatibilidad con código existente
        return this.obtenerTablaSimbolos();
    }

    valorParaReporte(valor) {
        if (!valor) return 'null';

        // FIX: manejar vectores
        if (valor.tipoDato && valor.tipoDato.startsWith('vector_')) {
            if (Array.isArray(valor.valor)) {
                if (valor.valor.length > 0 && Array.isArray(valor.valor[0])) {
                    return `[${valor.valor.map(fila => `[${fila.map(v => this.valorParaReporte(v)).join(', ')}]`).join(', ')}]`;
                }
                return `[${valor.valor.map(v => this.valorParaReporte(v)).join(', ')}]`;
            }
        }

        // FIX: manejar instancias de objeto
        if (valor.tipoDato === 'instancia_objeto') {
            return `Objeto(${valor.valor ? valor.valor.tipoObjeto : '?'})`;
        }

        // FIX: manejar tipo_objeto (definición de clase)
        if (valor.tipoDato === 'tipo_objeto') {
            return `TipoObjeto`;
        }

        // FIX: manejar funciones/procedimientos
        if (valor.tipoDato === 'funcion' || valor.tipoDato === 'procedimiento') {
            return `${valor.tipoDato}()`;
        }

        if (valor.tipoDato === 'cadena') {
            return `"${valor.valor}"`;
        }
        if (valor.tipoDato === 'caracter') {
            return `'${valor.valor}'`;
        }
        if (valor.tipoDato === 'booleano') {
            return valor.valor ? 'Verdadero' : 'Falso';
        }
        return String(valor.valor);
    }

    obtenerErrores() {
        return this.errores;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Interprete, TablaSimbolos };
}

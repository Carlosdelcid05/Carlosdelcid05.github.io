class GeneradorAST {
    constructor() {
        this.contador = 0;
        this.dot = '';
    }

    generar(ast) {
        this.contador = 0;
        this.dot = 'digraph AST {\n';
        this.dot += '  node [shape=box, style=rounded, fontname="Arial"];\n';
        this.dot += '  rankdir=TB;\n';
        this.dot += '  concentrate=true;\n\n';

        // Filtrar elementos inválidos primero
        const astFiltrado = this.filtrarAST(ast);
        
        const raiz = this.nuevoNodo('PROGRAMA');
        for (const instruccion of astFiltrado) {
            const nodoInstr = this.procesarInstruccion(instruccion);
            if (nodoInstr) {
                this.conectar(raiz, nodoInstr);
            }
        }

        this.dot += '}\n';
        return this.dot;
    }

    filtrarAST(ast) {
        if (!Array.isArray(ast)) return [];
        
        return ast.filter(item => {
            // Eliminar strings sueltos (puntos y coma, comas, etc.)
            if (typeof item === 'string') return false;
            
            // Eliminar objetos sin tipo
            if (item && typeof item === 'object' && !item.tipo) return false;
            
            // Eliminar null/undefined
            if (!item) return false;
            
            return true;
        });
    }

    procesarInstruccion(instruccion) {
        if (!instruccion || typeof instruccion !== 'object') {
            return null;
        }

        switch (instruccion.tipo) {
            case 'declaracion':
                return this.procesarDeclaracion(instruccion);
            case 'declaracion_multiple':
                return this.procesarDeclaracionMultiple(instruccion);
            case 'asignacion':
                return this.procesarAsignacion(instruccion);
            case 'imprimir':
                return this.procesarImprimir(instruccion);
            case 'si':
                return this.procesarSi(instruccion);
            case 'mientras':
                return this.procesarMientras(instruccion);
            case 'para':
                return this.procesarPara(instruccion);
            case 'detener':
                return this.nuevoNodo('DETENER');
            case 'continuar':
                return this.nuevoNodo('CONTINUAR');
            case 'retornar':
                return this.procesarRetornar(instruccion);
            case 'declaracion_funcion':
                return this.procesarDeclaracionFuncion(instruccion);
            case 'declaracion_procedimiento':
                return this.procesarDeclaracionProcedimiento(instruccion);
            case 'llamada':
                return this.procesarLlamada(instruccion);
            case 'declaracion_vector':
                return this.procesarDeclaracionVector(instruccion);
            case 'asignacion_vector':
                return this.procesarAsignacionVector(instruccion);
            case 'incremento':
                return this.procesarIncremento(instruccion);
            case 'decremento':
                return this.procesarDecremento(instruccion);
            case 'hacer_hasta':
                return this.procesarHacerHasta(instruccion);
            case 'tolower':
            case 'toupper':
                return this.procesarFuncionCadena(instruccion);
            // BUG5: tipos de objeto no manejados
            case 'declaracion_objeto':
                return this.procesarDeclaracionObjeto(instruccion);
            case 'declaracion_metodo_objeto':
                return this.procesarDeclaracionMetodoObjeto(instruccion);
            case 'instanciacion_objeto':
                return this.procesarInstanciacionObjeto(instruccion);
            case 'llamada_metodo_objeto':
                return this.procesarLlamadaMetodoObjeto(instruccion);
            case 'asignacion_atributo':
                return this.procesarAsignacionAtributo(instruccion);
            default:
                console.warn('Tipo de instrucción no manejado:', instruccion.tipo);
                return this.nuevoNodo(`DESCONOCIDO\\n${instruccion.tipo}`);
        }
    }

    procesarDeclaracion(decl) {
        const nodo = this.nuevoNodo('DECLARACION');
        const tipoNodo = this.nuevoNodo(`TIPO\\n${decl.tipoDato}`);
        const idNodo = this.nuevoNodo(`ID\\n${decl.identificador}`);
        
        this.conectar(nodo, tipoNodo, 'tipo');
        this.conectar(nodo, idNodo, 'id');

        if (decl.valor) {
            const valorNodo = this.procesarExpresion(decl.valor);
            if (valorNodo) {
                this.conectar(nodo, valorNodo, 'valor');
            }
        }

        return nodo;
    }

    procesarDeclaracionMultiple(decl) {
        const nodo = this.nuevoNodo('DECLARACION_MULTIPLE');
        const tipoNodo = this.nuevoNodo(`TIPO\\n${decl.tipoDato}`);
        this.conectar(nodo, tipoNodo, 'tipo');

        for (let i = 0; i < decl.identificadores.length; i++) {
            const idNodo = this.nuevoNodo(`ID\\n${decl.identificadores[i]}`);
            this.conectar(nodo, idNodo, `id${i}`);

            if (decl.valores && decl.valores[i]) {
                const valorNodo = this.procesarExpresion(decl.valores[i]);
                if (valorNodo) {
                    this.conectar(idNodo, valorNodo, 'valor');
                }
            }
        }

        return nodo;
    }

    procesarAsignacion(asig) {
        const nodo = this.nuevoNodo('ASIGNACION');
        const idNodo = this.nuevoNodo(`ID\\n${asig.identificador}`);
        const valorNodo = this.procesarExpresion(asig.valor);

        this.conectar(nodo, idNodo, 'id');
        if (valorNodo) {
            this.conectar(nodo, valorNodo, 'valor');
        }

        return nodo;
    }

    procesarImprimir(imprimir) {
        const nodo = this.nuevoNodo('IMPRIMIR');
        const exprNodo = this.procesarExpresion(imprimir.expresion);
        
        if (exprNodo) {
            this.conectar(nodo, exprNodo, 'expresion');
        }
        
        if (imprimir.saltoLinea) {
            const nlNodo = this.nuevoNodo('NL');
            this.conectar(nodo, nlNodo, 'salto');
        }

        return nodo;
    }

    procesarSi(si) {
        const nodo = this.nuevoNodo('SI');
        const condNodo = this.procesarExpresion(si.condicion);
        const verdaderoNodo = this.procesarBloque(si.bloqueVerdadero);

        this.conectar(nodo, condNodo, 'condicion');
        this.conectar(nodo, verdaderoNodo, 'verdadero');

        if (si.bloqueFalso) {
            // BUG1: bloqueFalso puede ser un objeto {tipo:'bloque_else_if',...} o un array (else simple)
            if (si.bloqueFalso.tipo === 'bloque_else_if') {
                const elseIfNodo = this.nuevoNodo('ELSE_IF');
                for (const oSi of si.bloqueFalso.listaOSi) {
                    const oSiNodo = this.nuevoNodo('O_SI');
                    const condOSi = this.procesarExpresion(oSi.condicion);
                    const bloqueOSi = this.procesarBloque(oSi.bloque);
                    this.conectar(oSiNodo, condOSi, 'condicion');
                    this.conectar(oSiNodo, bloqueOSi, 'bloque');
                    this.conectar(elseIfNodo, oSiNodo);
                }
                if (si.bloqueFalso.bloqueElse) {
                    const elseNodo = this.procesarBloque(si.bloqueFalso.bloqueElse);
                    this.conectar(elseIfNodo, elseNodo, 'else');
                }
                this.conectar(nodo, elseIfNodo, 'falso');
            } else {
                // Es un else simple (array de instrucciones)
                const falsoNodo = this.procesarBloque(si.bloqueFalso);
                this.conectar(nodo, falsoNodo, 'falso');
            }
        }

        return nodo;
    }

    procesarMientras(mientras) {
        const nodo = this.nuevoNodo('MIENTRAS');
        const condNodo = this.procesarExpresion(mientras.condicion);
        const bloqueNodo = this.procesarBloque(mientras.bloque);

        this.conectar(nodo, condNodo, 'condicion');
        this.conectar(nodo, bloqueNodo, 'bloque');

        return nodo;
    }

    procesarPara(para) {
        const nodo = this.nuevoNodo('PARA');
        
        if (para.inicializacion) {
            const initNodo = this.procesarInstruccion(para.inicializacion);
            if (initNodo) this.conectar(nodo, initNodo, 'inicializacion');
        }
        
        if (para.condicion) {
            const condNodo = this.procesarExpresion(para.condicion);
            if (condNodo) this.conectar(nodo, condNodo, 'condicion');
        }
        
        if (para.actualizacion) {
            const actNodo = this.procesarInstruccion(para.actualizacion);
            if (actNodo) this.conectar(nodo, actNodo, 'actualizacion');
        }
        
        if (para.bloque) {
            const bloqueNodo = this.procesarBloque(para.bloque);
            if (bloqueNodo) this.conectar(nodo, bloqueNodo, 'bloque');
        }

        return nodo;
    }

    procesarRetornar(ret) {
        const nodo = this.nuevoNodo('RETORNAR');
        
        if (ret.expresion) {
            const exprNodo = this.procesarExpresion(ret.expresion);
            if (exprNodo) {
                this.conectar(nodo, exprNodo, 'expresion');
            }
        }

        return nodo;
    }

    procesarDeclaracionFuncion(func) {
        const nodo = this.nuevoNodo(`FUNCION\\n${func.identificador}`);
        const tipoNodo = this.nuevoNodo(`TIPO_RETORNO\\n${func.tipoDato}`);
        this.conectar(nodo, tipoNodo, 'retorno');

        // Parámetros
        if (func.parametros && func.parametros.length > 0) {
            const paramsNodo = this.nuevoNodo('PARAMETROS');
            for (const param of func.parametros) {
                const paramNodo = this.nuevoNodo(`${param.tipo} ${param.identificador}`);
                this.conectar(paramsNodo, paramNodo);
            }
            this.conectar(nodo, paramsNodo, 'parametros');
        }

        // Bloque
        if (func.bloque) {
            const bloqueNodo = this.procesarBloque(func.bloque);
            this.conectar(nodo, bloqueNodo, 'bloque');
        }

        return nodo;
    }

    procesarDeclaracionProcedimiento(proc) {
        const nodo = this.nuevoNodo(`PROCEDIMIENTO\\n${proc.identificador}`);

        if (proc.parametros && proc.parametros.length > 0) {
            const paramsNodo = this.nuevoNodo('PARAMETROS');
            for (const param of proc.parametros) {
                const paramNodo = this.nuevoNodo(`${param.tipo} ${param.identificador}`);
                this.conectar(paramsNodo, paramNodo);
            }
            this.conectar(nodo, paramsNodo, 'parametros');
        }

        if (proc.bloque) {
            const bloqueNodo = this.procesarBloque(proc.bloque);
            this.conectar(nodo, bloqueNodo, 'bloque');
        }

        return nodo;
    }

    procesarLlamada(llamada) {
        const nodo = this.nuevoNodo(`LLAMADA\\n${llamada.identificador}`);

        if (llamada.argumentos && llamada.argumentos.length > 0) {
            const argsNodo = this.nuevoNodo('ARGUMENTOS');
            for (const arg of llamada.argumentos) {
                const argNodo = this.procesarExpresion(arg);
                if (argNodo) {
                    this.conectar(argsNodo, argNodo);
                }
            }
            this.conectar(nodo, argsNodo, 'argumentos');
        }

        return nodo;
    }

    procesarBloque(bloque) {
        const nodo = this.nuevoNodo('BLOQUE');
        
        // BUG8: bloque puede ser un objeto en lugar de un array (e.g. bloque_else_if)
        // Solo iterar si es un array válido
        if (Array.isArray(bloque)) {
            for (const instruccion of bloque) {
                const instrNodo = this.procesarInstruccion(instruccion);
                if (instrNodo) {
                    this.conectar(nodo, instrNodo);
                }
            }
        } else if (bloque && typeof bloque === 'object' && bloque.tipo) {
            // Es un nodo AST individual, procesarlo como instrucción
            const instrNodo = this.procesarInstruccion(bloque);
            if (instrNodo) this.conectar(nodo, instrNodo);
        }
        
        return nodo;
    }

    procesarExpresion(expr) {
        if (!expr) return null;

        switch (expr.tipo) {
            case 'literal': {
                let valor = expr.valor;
                if (typeof valor === 'string') {
                    valor = valor.length > 10 ? valor.substring(0, 10) + '...' : valor;
                }
                if (typeof valor === 'boolean') {
                    valor = valor ? 'Verdadero' : 'Falso';
                }
                return this.nuevoNodo(`${expr.tipoDato}\\n${valor}`);
            }
            
            case 'identificador':
                return this.nuevoNodo(`ID\\n${expr.valor}`);
            
            // BUG2: envolver en {} para evitar conflicto de const entre cases
            case 'aritmetica':
            case 'relacional': {
                const nodoOp = this.nuevoNodo(expr.operador);
                const izqNodo = this.procesarExpresion(expr.izq);
                const derNodo = this.procesarExpresion(expr.der);
                // BUG9: verificar que los nodos no sean null antes de conectar
                if (izqNodo) this.conectar(nodoOp, izqNodo, 'izq');
                if (derNodo) this.conectar(nodoOp, derNodo, 'der');
                return nodoOp;
            }

            // BUG4: '!' es unario - tiene expr.expresion, no izq/der
            case 'logica': {
                if (expr.operador === '!') {
                    const nodoNot = this.nuevoNodo('!');
                    const expNodo = this.procesarExpresion(expr.expresion);
                    if (expNodo) this.conectar(nodoNot, expNodo, 'expr');
                    return nodoNot;
                }
                const nodoOp = this.nuevoNodo(expr.operador);
                const izqNodo = this.procesarExpresion(expr.izq);
                const derNodo = this.procesarExpresion(expr.der);
                if (izqNodo) this.conectar(nodoOp, izqNodo, 'izq');
                if (derNodo) this.conectar(nodoOp, derNodo, 'der');
                return nodoOp;
            }
            
            case 'unaria': {
                const nodoUnario = this.nuevoNodo('-unario');
                const expNodo = this.procesarExpresion(expr.expresion);
                if (expNodo) this.conectar(nodoUnario, expNodo, 'expr');
                return nodoUnario;
            }
            
            case 'ternario': {
                const nodoTernario = this.nuevoNodo('TERNARIO');
                const condNodo = this.procesarExpresion(expr.condicion);
                const verdNodo = this.procesarExpresion(expr.verdadero);
                const falsoNodo = this.procesarExpresion(expr.falso);
                if (condNodo) this.conectar(nodoTernario, condNodo, 'cond');
                if (verdNodo) this.conectar(nodoTernario, verdNodo, 'verd');
                if (falsoNodo) this.conectar(nodoTernario, falsoNodo, 'falso');
                return nodoTernario;
            }

            // BUG3: casteo no estaba manejado
            case 'casteo': {
                const nodoCasteo = this.nuevoNodo(`CASTEO\\n(${expr.tipoCasteo})`);
                const expNodo = this.procesarExpresion(expr.expresion);
                if (expNodo) this.conectar(nodoCasteo, expNodo, 'expr');
                return nodoCasteo;
            }

            // BUG3: tolower_expr y toupper_expr no estaban manejados
            case 'tolower_expr': {
                const nodoTL = this.nuevoNodo('TOLOWER');
                const expNodo = this.procesarExpresion(expr.expresion);
                if (expNodo) this.conectar(nodoTL, expNodo, 'expr');
                return nodoTL;
            }

            case 'toupper_expr': {
                const nodoTU = this.nuevoNodo('TOUPPER');
                const expNodo = this.procesarExpresion(expr.expresion);
                if (expNodo) this.conectar(nodoTU, expNodo, 'expr');
                return nodoTU;
            }

            case 'llamada':
                return this.procesarLlamada(expr);

            // BUG3: llamada_metodo_objeto no estaba manejado
            case 'llamada_metodo_objeto': {
                const nodoLM = this.nuevoNodo(`LLAMADA_METODO\\n${expr.instancia}.${expr.metodo}`);
                if (expr.argumentos && expr.argumentos.length > 0) {
                    const argsNodo = this.nuevoNodo('ARGUMENTOS');
                    for (const arg of expr.argumentos) {
                        const argNodo = this.procesarExpresion(arg);
                        if (argNodo) this.conectar(argsNodo, argNodo);
                    }
                    this.conectar(nodoLM, argsNodo, 'args');
                }
                return nodoLM;
            }

            case 'acceso_vector': {
                const nodoAcceso = this.nuevoNodo('ACCESO_VECTOR');
                const idNodo = this.nuevoNodo(`ID\\n${expr.identificador}`);
                const indice1Nodo = this.procesarExpresion(expr.indice1);
                
                this.conectar(nodoAcceso, idNodo, 'vector');
                if (indice1Nodo) this.conectar(nodoAcceso, indice1Nodo, 'indice1');
                
                if (expr.indice2) {
                    const indice2Nodo = this.procesarExpresion(expr.indice2);
                    if (indice2Nodo) this.conectar(nodoAcceso, indice2Nodo, 'indice2');
                }
                
                return nodoAcceso;
            }

            // BUG3: acceso_atributo no estaba manejado
            case 'acceso_atributo': {
                const nodoAA = this.nuevoNodo(`ATRIBUTO\\n${expr.instancia}.${expr.atributo}`);
                return nodoAA;
            }
            
            default:
                console.warn('Tipo de expresión no manejado:', expr.tipo);
                return this.nuevoNodo(`EXPR\\n${expr.tipo}`);
        }
    }

    procesarDeclaracionVector(vec) {
        // BUG7: completar stub con información del vector
        const dim = vec.dimension === 2 ? '[][]' : '[]';
        const nodo = this.nuevoNodo(`VECTOR${dim}\\n${vec.tipoDato} ${vec.identificador}`);
        
        if (vec.tamanio1) {
            const tam1 = this.procesarExpresion(vec.tamanio1);
            if (tam1) this.conectar(nodo, tam1, 'tam1');
        }
        if (vec.tamanio2) {
            const tam2 = this.procesarExpresion(vec.tamanio2);
            if (tam2) this.conectar(nodo, tam2, 'tam2');
        }
        if (vec.valores) {
            const valsNodo = this.nuevoNodo('VALORES_INICIALES');
            this.conectar(nodo, valsNodo, 'valores');
        }
        return nodo;
    }

    procesarAsignacionVector(asig) {
        // BUG7: completar stub con información de la asignación
        const nodo = this.nuevoNodo(`ASIGNACION_VECTOR\\n${asig.identificador}`);
        const idx1 = this.procesarExpresion(asig.indice1);
        if (idx1) this.conectar(nodo, idx1, 'indice1');
        if (asig.indice2) {
            const idx2 = this.procesarExpresion(asig.indice2);
            if (idx2) this.conectar(nodo, idx2, 'indice2');
        }
        const valNodo = this.procesarExpresion(asig.valor);
        if (valNodo) this.conectar(nodo, valNodo, 'valor');
        return nodo;
    }

    // BUG5: métodos de objeto faltantes
    procesarDeclaracionObjeto(obj) {
        const nodo = this.nuevoNodo(`OBJETO\\n${obj.identificador}`);
        if (obj.atributos && obj.atributos.length > 0) {
            const attrsNodo = this.nuevoNodo('ATRIBUTOS');
            for (const attr of obj.atributos) {
                const attrNodo = this.nuevoNodo(`${attr.tipo}\\n${attr.identificador}`);
                this.conectar(attrsNodo, attrNodo);
            }
            this.conectar(nodo, attrsNodo, 'atributos');
        }
        return nodo;
    }

    procesarDeclaracionMetodoObjeto(metodo) {
        const nodo = this.nuevoNodo(`METODO\\n${metodo.nombreObjeto}.${metodo.nombreMetodo}`);
        if (metodo.parametros && metodo.parametros.length > 0) {
            const paramsNodo = this.nuevoNodo('PARAMETROS');
            for (const param of metodo.parametros) {
                const paramNodo = this.nuevoNodo(`${param.tipo}\\n${param.identificador}`);
                this.conectar(paramsNodo, paramNodo);
            }
            this.conectar(nodo, paramsNodo, 'params');
        }
        if (metodo.bloque) {
            const bloqueNodo = this.procesarBloque(metodo.bloque);
            this.conectar(nodo, bloqueNodo, 'bloque');
        }
        return nodo;
    }

    procesarInstanciacionObjeto(inst) {
        const nodo = this.nuevoNodo(`INSTANCIAR\\n${inst.identificador}\\n-> ${inst.nombreObjeto}`);
        if (inst.valores && inst.valores.length > 0) {
            const valsNodo = this.nuevoNodo('VALORES');
            for (const val of inst.valores) {
                const valNodo = this.procesarExpresion(val);
                if (valNodo) this.conectar(valsNodo, valNodo);
            }
            this.conectar(nodo, valsNodo, 'valores');
        }
        return nodo;
    }

    procesarLlamadaMetodoObjeto(llamada) {
        const nodo = this.nuevoNodo(`LLAMADA_METODO\\n${llamada.instancia}.${llamada.metodo}`);
        if (llamada.argumentos && llamada.argumentos.length > 0) {
            const argsNodo = this.nuevoNodo('ARGUMENTOS');
            for (const arg of llamada.argumentos) {
                const argNodo = this.procesarExpresion(arg);
                if (argNodo) this.conectar(argsNodo, argNodo);
            }
            this.conectar(nodo, argsNodo, 'args');
        }
        return nodo;
    }

    procesarAsignacionAtributo(asig) {
        const nodo = this.nuevoNodo(`ASIG_ATRIBUTO\\n${asig.instancia}.${asig.atributo}`);
        const valNodo = this.procesarExpresion(asig.valor);
        if (valNodo) this.conectar(nodo, valNodo, 'valor');
        return nodo;
    }

    procesarIncremento(inc) {
        const nodo = this.nuevoNodo('INCREMENTO');
        const idNodo = this.nuevoNodo(`ID\\n${inc.identificador}`);
        this.conectar(nodo, idNodo, 'variable');
        return nodo;
    }

    procesarDecremento(dec) {
        const nodo = this.nuevoNodo('DECREMENTO');
        const idNodo = this.nuevoNodo(`ID\\n${dec.identificador}`);
        this.conectar(nodo, idNodo, 'variable');
        return nodo;
    }

    procesarHacerHasta(hh) {
        const nodo = this.nuevoNodo('HACER_HASTA');
        const bloqueNodo = this.procesarBloque(hh.bloque);
        const condNodo = this.procesarExpresion(hh.condicion);
        
        this.conectar(nodo, bloqueNodo, 'bloque');
        this.conectar(nodo, condNodo, 'condicion');
        
        return nodo;
    }

    procesarFuncionCadena(func) {
        const nodo = this.nuevoNodo(func.tipo.toUpperCase());
        const exprNodo = this.procesarExpresion(func.expresion);
        
        if (exprNodo) {
            this.conectar(nodo, exprNodo, 'expresion');
        }
        
        return nodo;
    }

    nuevoNodo(etiqueta) {
        const id = `n${this.contador++}`;
        const etiquetaEscapada = this.escapearEtiqueta(etiqueta);
        this.dot += `  ${id} [label="${etiquetaEscapada}"];\n`;
        return id;
    }

    conectar(padre, hijo, etiqueta = '') {
        const label = etiqueta ? ` [label="${this.escapearEtiqueta(etiqueta)}"]` : '';
        this.dot += `  ${padre} -> ${hijo}${label};\n`;
    }

    escapearEtiqueta(etiqueta) {
        if (!etiqueta) return '';
        
        return etiqueta
            .replace(/\\/g, '\\\\')   // primero escapear backslashes reales
            .replace(/\n/g, '\\n')    // BUG6: salto de línea real → \n para Graphviz
            .replace(/"/g, '\\"')
            .replace(/\|/g, '\\|')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/</g, '\\<')
            .replace(/>/g, '\\>')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]');
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GeneradorAST };
}
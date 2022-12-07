function juegoTotito(){

// Elementos iniciales
const btnE = document.getElementById("empezar");
const totitoCuerpo = document.getElementById("totito");
const contenedor = document.querySelector(".contenedor")
let turno = "X"
const intf = document.querySelector(".interfaz")
let clic = 0


//Botones
function totito() { 
const fragmento = document.createDocumentFragment();
    for(i = 0; i <= 8; i++){

        const cuerpo = document.createElement("button");
        cuerpo.classList.add("cuerpo");
        cuerpo.setAttribute("id",`${i}`)
        fragmento.appendChild(cuerpo);
       
    }
    return fragmento;
}

//Interfaz del juego
function partida() {

    const titulo = document.createElement("h1");
    titulo.setAttribute("id","titulo");
    titulo.textContent="HORA DE JUGAR";
    intf.appendChild(titulo);

    const rncr = document.createElement("button");
    rncr.setAttribute("id","reiniciar");
    rncr.setAttribute("onclick", `onclick="location.reload()"`)
    rncr.innerHTML= "REINICIAR";
    intf.appendChild(rncr);

    const turnoM = document.createElement("h2");
    turnoM.setAttribute("id","turno");
    intf.appendChild(turnoM);

    return turnoM;
}

//Funcion del boton comenzar

btnE.addEventListener("click",()=> {
const comenzar = document.getElementById("comenzar");
 comenzar.innerHTML= ""
 
totitoCuerpo.appendChild(totito());
 partida();  
 botones(); 
 
 });


//Botones funcionales
 function botones(){
const btn = [];
for (let i = 0; i < 9; i++){
    btn[i] = document.getElementById(`${i}`)
}


    btn[0].addEventListener("click",funbtn1)

    btn[1].addEventListener("click",funbtn2)

    btn[2].addEventListener("click",funbtn3)
        
    btn[3].addEventListener("click",funbtn4)

    btn[4].addEventListener("click",funbtn5)
               
    btn[5].addEventListener("click",funbtn6)
        
    btn[6].addEventListener("click",funbtn7)

    btn[7].addEventListener("click",funbtn8)

    btn[8].addEventListener("click",funbtn9)

        //Funcion de los botones
    function funbtn1(){
        btn[0].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[0].removeEventListener("click", funbtn1)
    }
    function funbtn2(){
        btn[1].textContent = turno 
        turnos()
        clic = clic + 1
        gndr()
        btn[1].removeEventListener("click", funbtn2)
    }
    function funbtn3(){
        btn[2].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[2].removeEventListener("click", funbtn3)
    }
    function funbtn4(){
        btn[3].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[3].removeEventListener("click", funbtn4)
    }
    function funbtn5(){
        btn[4].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[4].removeEventListener("click", funbtn5)
    }
    function funbtn6(){
        btn[5].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[5].removeEventListener("click", funbtn6)
    }
    function funbtn7(){
        btn[6].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[6].removeEventListener("click", funbtn7)
    }
    function funbtn8(){
        btn[7].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[7].removeEventListener("click", funbtn8)
    }
    function funbtn9(){
        btn[8].textContent = turno
        turnos()
        clic = clic + 1
        gndr()
        btn[8].removeEventListener("click", funbtn9)
    }

    
    function gndr(){
        if(clic >= 5){
            if ((((btn[0].textContent == "X" && btn[1].textContent == "X" && btn[2].textContent ) == "X") || 
                ((btn[3].textContent == "X" && btn[4].textContent == "X" && btn[5].textContent == "X") ) ||
                ((btn[6].textContent == "X" && btn[7].textContent == "X" && btn[8].textContent == "X") ) ||
                ((btn[0].textContent == "X" && btn[3].textContent == "X" && btn[6].textContent == "X") ) ||
                ((btn[1].textContent == "X" && btn[4].textContent == "X" && btn[7].textContent == "X") ) ||
                ((btn[2].textContent == "X" && btn[5].textContent == "X" && btn[7].textContent == "X") ) ||
                ((btn[0].textContent == "X" && btn[4].textContent == "X" && btn[8].textContent == "X") ) ||
                ((btn[6].textContent == "X" && btn[4].textContent == "X" && btn[2].textContent == "X")) )){
                    var tur = document.getElementById("turno")
                    tur.textContent = "HA GANADO X"
                    intf.appendChild(tur)
                    btn[0].removeEventListener("click", funbtn1)
                    btn[1].removeEventListener("click", funbtn2)
                    btn[2].removeEventListener("click", funbtn3)
                    btn[3].removeEventListener("click", funbtn4)
                    btn[4].removeEventListener("click", funbtn5)
                    btn[5].removeEventListener("click", funbtn6)
                    btn[6].removeEventListener("click", funbtn7)
                    btn[7].removeEventListener("click", funbtn8)
                    btn[8].removeEventListener("click", funbtn9)

                } else if ((((btn[0].textContent == "O" && btn[1].textContent == "O" && btn[2].textContent ) == "O") || 
                ((btn[3].textContent == "O" && btn[4].textContent == "O" && btn[5].textContent == "O") ) ||
                ((btn[6].textContent == "O" && btn[7].textContent == "O" && btn[8].textContent == "O") ) ||
                ((btn[0].textContent == "O" && btn[3].textContent == "O" && btn[6].textContent == "O") ) ||
                ((btn[1].textContent == "O" && btn[4].textContent == "O" && btn[7].textContent == "O") ) ||
                ((btn[2].textContent == "O" && btn[5].textContent == "O" && btn[7].textContent == "O") ) ||
                ((btn[0].textContent == "O" && btn[4].textContent == "O" && btn[8].textContent == "O") ) ||
                ((btn[6].textContent == "O" && btn[4].textContent == "O" && btn[2].textContent == "O")) )){
                    var tur = document.getElementById("turno")
                    tur.textContent = "HA GANADO O"
                    intf.appendChild(tur)
                    btn[0].removeEventListener("click", funbtn1)
                    btn[1].removeEventListener("click", funbtn2)
                    btn[2].removeEventListener("click", funbtn3)
                    btn[3].removeEventListener("click", funbtn4)
                    btn[4].removeEventListener("click", funbtn5)
                    btn[5].removeEventListener("click", funbtn6)
                    btn[6].removeEventListener("click", funbtn7)
                    btn[7].removeEventListener("click", funbtn8)
                    btn[8].removeEventListener("click", funbtn9) 
                }
            }
    }
    const reiniciar = document.getElementById("reiniciar")
    reiniciar.addEventListener("click",()=>{
        clic = 0;
         
        var tur = document.getElementById("turno")
   tur.textContent = ""
   turno = "X"
   intf.appendChild(tur)
        totitoCuerpo.innerHTML = "";
        totitoCuerpo.appendChild(totito())
        botones()
    })
 }
    //boton reiniciar

    



//Cambiar el turno
function turnos(){
 if (turno == "X"){ 
 turno = "O"
   var tur = document.getElementById("turno")
   tur.textContent = "Es turno de O"
   intf.appendChild(tur)
 } else if (turno == "O") {
    turno = "X"
    var tur = document.getElementById("turno")
   tur.textContent = "Es turno de X"
   intf.appendChild(tur)
 }
}
}



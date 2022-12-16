"use strict";

//Variebles
let turno = "X";
let clic = 0;
let p1 = 0;
let p2 = 0;

//DOM
const Turno = document.getElementById("turno");
const Turnos = document.querySelector(".turno"); 
const P1 = document.getElementById("p1");
const P2 = document.getElementById("p2");
const titulo = document.getElementById("titulo");
const tiempo = document.getElementById("tiempo");



//Botones
let btn = [];
for (let i = 0; i < 9; i++){
    btn[i] = document.getElementById(`${i}`);
}



// EventListenes
function eventos() {

    btn[0].addEventListener("click",funbtn1);

    btn[1].addEventListener("click",funbtn2);

    btn[2].addEventListener("click",funbtn3);
        
    btn[3].addEventListener("click",funbtn4);

    btn[4].addEventListener("click",funbtn5);
                
    btn[5].addEventListener("click",funbtn6);
        
    btn[6].addEventListener("click",funbtn7);

    btn[7].addEventListener("click",funbtn8);

    btn[8].addEventListener("click",funbtn9);

}



//Funcion refrescar automaticamente
let t = 3;
let toID;
function rfcr() {
    toID = setInterval(cuentaRegrsiva, 1000);
}

function cuentaRegrsiva(){
    
    if (!(tiempo.textContent == "0")) { 
        --t;
        tiempo.textContent = `${t}`;
    } else {
        clearInterval(toID);
        toID = null;

        turno = "X";
        clic = 0;

        for (let i = 0 ; i < 9 ; i++) {
            btn[i].textContent = " " 
        }

        titulo.textContent = "¡Totito!"
        eventos();
        t = 3

        titulo.classList.remove("ganado");

        Turno.textContent = "Turno de: "
    }
}
    


//Funcion ganador 

function ganador() {

    if (clic >= 5){
        
        let btnG = []
        
        for (let i = 0; i < 9; i++) {
            btnG[i] = btn[i].textContent;
        }

        
        const rEventos = ()=> {
            
            btn[0].removeEventListener("click",funbtn1);

            btn[1].removeEventListener("click",funbtn2);

            btn[2].removeEventListener("click",funbtn3);
                
            btn[3].removeEventListener("click",funbtn4);

            btn[4].removeEventListener("click",funbtn5);
                        
            btn[5].removeEventListener("click",funbtn6);
                
            btn[6].removeEventListener("click",funbtn7);

            btn[7].removeEventListener("click",funbtn8);

            btn[8].removeEventListener("click",funbtn9);
        }

        const Xgndr = ()=>{ 
            p1 += 1;
            P1.textContent = `${p1}`;
            titulo.textContent = "¡GANÓ X!";
            titulo.classList.add("ganado");
            tiempo.textContent = "3";
            rfcr();
            rEventos();
        }
        
        const Ogndr = ()=>{ 
            p2 += 1;
            P2.textContent = `${p2}`;
            titulo.textContent = "¡GANÓ O!";
            titulo.classList.add("ganado");
            tiempo.textContent = "3";
            rfcr();
            rEventos();
        }
        
            if (btnG[0] == "X" && btnG[1] == "X" && btnG[2] == "X") {Xgndr()}
            else if (btnG[3] == "X" && btnG[4] == "X" && btnG[5] == "X") {Xgndr()}
            else if (btnG[6] == "X" && btnG[7] == "X" && btnG[8] == "X") {Xgndr()}
            else if (btnG[0] == "X" && btnG[3] == "X" && btnG[6] == "X") {Xgndr()}
            else if (btnG[1] == "X" && btnG[4] == "X" && btnG[7] == "X") {Xgndr()}
            else if (btnG[2] == "X" && btnG[5] == "X" && btnG[8] == "X") {Xgndr()}
            else if (btnG[0] == "X" && btnG[4] == "X" && btnG[8] == "X") {Xgndr()}
            else if (btnG[2] == "X" && btnG[4] == "X" && btnG[6] == "X") {Xgndr()}

            else if (btnG[0] == "O" && btnG[1] == "O" && btnG[2] == "O") {Ogndr()}
            else if (btnG[3] == "O" && btnG[4] == "O" && btnG[5] == "O") {Ogndr()}
            else if (btnG[6] == "O" && btnG[7] == "O" && btnG[8] == "O") {Ogndr()}
            else if (btnG[0] == "O" && btnG[3] == "O" && btnG[6] == "O") {Ogndr()}
            else if (btnG[1] == "O" && btnG[4] == "O" && btnG[7] == "O") {Ogndr()}
            else if (btnG[2] == "O" && btnG[5] == "O" && btnG[8] == "O") {Ogndr()}
            else if (btnG[0] == "O" && btnG[4] == "O" && btnG[8] == "O") {Ogndr()}
            else if (btnG[2] == "O" && btnG[4] == "O" && btnG[6] == "O") {Ogndr()}

            else if(clic >= 9) { rfcr();}
    }
    

}



//Funciones de los botones

function funbtn1() {
    btn[0].textContent = turno;
    turnos();
    clic += 1;
    btn[0].removeEventListener("click", funbtn1);
    ganador();
}
function funbtn2() {
    btn[1].textContent = turno;
    turnos();
    clic += 1;
    btn[1].removeEventListener("click", funbtn2);
    ganador();
}

function funbtn3() {
    btn[2].textContent = turno;
    turnos();
    clic += 1;
    btn[2].removeEventListener("click", funbtn3);
    ganador();
}

function funbtn4() {
    btn[3].textContent = turno;
    turnos();
    clic += 1;
    btn[3].removeEventListener("click", funbtn4);
    ganador();
    
}

function funbtn5() {
    btn[4].textContent = turno;
    turnos();
    clic += 1;
    btn[4].removeEventListener("click", funbtn5);
    ganador();
}

function funbtn6() {
    btn[5].textContent = turno;
    turnos();
    clic += 1;
    btn[5].removeEventListener("click", funbtn6);
    ganador();
}

function funbtn7() {
    btn[6].textContent = turno;
    turnos();
    clic += 1;
    btn[6].removeEventListener("click", funbtn7);
    ganador();
}

function funbtn8() {
    btn[7].textContent = turno;
    turnos();
    clic += 1;
    btn[7].removeEventListener("click", funbtn8);
    ganador();
}

function funbtn9() {
    btn[8].textContent = turno;
    turnos();
    clic += 1;
    btn[8].removeEventListener("click", funbtn9);
    ganador();
}
    
    

//Cambiar el turno
function turnos(){
    if (turno == "X"){ 
      turno = "O";
      Turno.textContent = "Turno de: O";
      Turnos.appendChild(Turno);
    } else if (turno == "O") {
       turno = "X";
       Turno.textContent = "Turno de: X";
       Turnos.appendChild(Turno);
    }
    else {
        turno = "X";
    }
   }
//Ce code vient d'un tuto pour créé Asteroids
//J'ai copie-coller le code (https://www.newthinktank.com/2019/07/javascript-asteroids/)
//car je suis tombé sur plein de comportements inattendus que j'ai du réglé avec ChatGPT
//Or cela m'a causé encore plus de problème.

let canvas;
let ctx;
let canvasWidth = 1400;
let canvasHeight = 900;
let keys = [];
let ship;
let bullets = [];
let bloons = [];
let score = 0;
let lives = 3;

let highScore;
let localStorageName = "HighScore";

document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas(){
    canvas = document.getElementById("my-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ship = new Ship();

    for(let i = 0; i < 8; i++){
        bloons.push(new Bloon());
    }

    // Stock tout les potentielles keycodes dans un array pour
    // pour de multiple touches marche en même temps
    // document.body.addEventListener("keydown", function(e) {
    //     keys[e.keyCode] = true;
    // });
    // document.body.addEventListener("keyup", function(e) {
    //     keys[e.keyCode] = false;
    //     if (e.keyCode === 32){
    //         bullets.push(new Bullet(ship.angle));
    //     }
    // });
    document.body.addEventListener("keydown", HandleKeyDown);
    document.body.addEventListener("keyup", HandleKeyUp);

    // Récupère les highs scores stocké localement
    if (localStorage.getItem(localStorageName) == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem(localStorageName);
    }

    Render();
}

// Ici sont placés les fonctions qui gèrent les événements
// pour que ces fonctions s'arrêtent lorsqu'on atteint le game over
function HandleKeyDown(e){
    keys[e.keyCode] = true;
}
function HandleKeyUp(e){
    keys[e.keyCode] = false;
    if (e.keyCode === 32){
        bullets.push(new Bullet(ship.angle));
    }
}

class Ship {
    constructor() {
        this.visible = true;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.movingForward = false;
        this.speed = 0.1;
        this.velX = 0;
        this.velY = 0;
        this.rotateSpeed = 0.001;
        this.radius = 15;
        this.angle = 0;
        this.strokeColor = 'white';
        // Pour savoir où seront tirés les balles
        this.noseX = canvasWidth / 2 + 15;
        this.noseY = canvasHeight / 2;
    }
    Rotate(dir) {
        this.angle += this.rotateSpeed * dir;
    }
    Update() {
        // Permet d'avoir la direction dont le vaisseau fait face
        let radians = this.angle / Math.PI * 180;

        // Si movingForward, calcule les nouvelles valeurs de x et y
        // pour savoir le nouveau point de x on utilise la 
        // formule ancienX + cos(radians) * distance
        // Forumle pour y ancienY + sin(radians) * distance
        if (this.movingForward) {
            this.velX += Math.cos(radians) * this.speed;
            this.velY += Math.sin(radians) * this.speed;
        }
        // Si le vaisseau dépasse le tableau du jeu elle revient
        // au côté opposé    
        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
        // Décélere le vaisseau si on ne maintient pas la touche 
        this.velX *= 0.99;
        this.velY *= 0.99;

        // Change la valeur de x et y en prenant
        // compte de la "friction de l'air"  
        this.x -= this.velX;
        this.y -= this.velY;
    }
    Draw() {
        ctx.strokeStyle = this.strokeColor;
        ctx.beginPath();
        // L'angle entre les sommets du vaisseau (vertices = sommets en EN)
        let vertAngle = ((Math.PI * 2) / 3);

        let radians = this.angle / Math.PI * 180;
        // Là où sont tirés les balles
        this.noseX = this.x - this.radius * Math.cos(radians);
        this.noseY = this.y - this.radius * Math.sin(radians);

        for (let i = 0; i < 3; i++) {
            ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
}

class Bullet{
    constructor(angle) {
        this.visible = true;
        this.x = ship.noseX;
        this.y = ship.noseY;
        this.angle = angle;
        this.height = 4;
        this.width = 4;
        this.speed = 5;
        this.velX = 0;
        this.velY = 0;
    }
    Update(){
        let radians = this.angle / Math.PI * 180;
        this.x -= Math.cos(radians) * this.speed;
        this.y -= Math.sin(radians) * this.speed;
    }
    Draw(){
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
}

class Bloon{
    constructor(x,y,radius,level,collisionRadius) {
        this.visible = true;
        this.x = x || Math.floor(Math.random() * canvasWidth);
        this.y = y || Math.floor(Math.random() * canvasHeight);
        this.speed = 3;
        this.radius = radius || 50;
        this.angle = Math.floor(Math.random() * 359);
        this.strokeColor = 'white';
        this.collisionRadius = collisionRadius || 46;
        // Utilisé pour décidé si le ballon peut être divisé en plusieurs petits ballons
        this.level = level || 1;  
    }
    Update(){
        let radians = this.angle / Math.PI * 180;
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;
        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
    }
    Draw(){
        ctx.beginPath();
        ctx.strokeStyle = this.strokeColor;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

function CircleCollision(p1x, p1y, r1, p2x, p2y, r2){
    let radiusSum;
    let xDiff;
    let yDiff;

    radiusSum = r1 + r2;
    xDiff = p1x - p2x;
    yDiff = p1y - p2y;

    if (radiusSum > Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))) {
        return true;
    } else {
        return false;
    }
}

// S'occupe de dessiner les vies du vaisseau sur l'écran de jeu
function DrawLifeShips(){
    let startX = 1350;
    let startY = 10;
    let points = [[9, 9], [-9, 9]];
    ctx.strokeStyle = 'white'; // la couleur du trait du vaisseau
    // Parcours toutes les vies restantes du vaisseau
    for(let i = 0; i < lives; i++){
        // dessine les vaisseaux
        ctx.beginPath();
        // Place au point d'origine
        ctx.moveTo(startX, startY);
        // Parcours tout les autres points
        for(let j = 0; j < points.length; j++){
            ctx.lineTo(startX + points[j][0], 
                startY + points[j][1]);
        }
        // Dessine du dernier point au 1er point d'origine
        ctx.closePath();
        // Dessine les traits de la forme du vaisseau en blanc
        ctx.stroke();
        // Place la nouvelle forme de 30 pixels à gauche
        startX -= 30;
    }
}

function Render() {
    // Vérifie si le vaisseau avance 
    ship.movingForward = (keys[90]);

    if (keys[68]) {
        // la touche d fait une rotation à droite
        ship.Rotate(1);
    }
    if (keys[81]) {
        // la touche q fait une rotation à gauche
       ship.Rotate(-1);
    }
   
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Montre le score
    ctx.fillStyle = 'white';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE : " + score.toString(), 20, 35);

    // Si il n'y a plus vie : signale le game over
    if(lives <= 0){
        // Si il y a le game over : enlève les fonctions qui reçoit les inputs 
        document.body.removeEventListener("keydown", HandleKeyDown);
        document.body.removeEventListener("keyup", HandleKeyUp);

        ship.visible = false;
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText("GAME OVER", canvasWidth / 2 - 150, canvasHeight / 2);
    }

    // Créée un nouveau niveau de taille des ballons et augmente leurs vitesses
    if(bloons.length === 0){
        ship.x = canvasWidth / 2;
        ship.y = canvasHeight / 2;
        ship.velX = 0;
        ship.velY = 0;
        for(let i = 0; i < 8; i++){
            let bloon = new Bloon();
            bloon.speed += .5;
            bloons.push(bloon);
        }
    }

    // Dessine les vies du vaisseau
    DrawLifeShips();

    // Vérifie la collision du vaisseau avec les ballons
    if (bloons.length !== 0) {
        for(let k = 0; k < bloons.length; k++){
            if(CircleCollision(ship.x, ship.y, 11, bloons[k].x, bloons[k].y, bloons[k].collisionRadius)){
                ship.x = canvasWidth / 2;
                ship.y = canvasHeight / 2;
                ship.velX = 0;
                ship.velY = 0;
                lives -= 1;
            }
        }
    }

    // Vérifie la collision entre les balles et les ballons
    if (bloons.length !== 0 && bullets.length != 0){
loop1:
        for(let l = 0; l < bloons.length; l++){
            for(let m = 0; m < bullets.length; m++){
                if(CircleCollision(bullets[m].x, bullets[m].y, 3, bloons[l].x, bloons[l].y, bloons[l].collisionRadius)){
                    // Vérifie si le ballon peut être diviser en plusieurs petits ballons
                    if(bloons[l].level === 1){
                        bloons.push(new Bloon(bloons[l].x - 5, bloons[l].y - 5, 25, 2, 22));
                        bloons.push(new Bloon(bloons[l].x + 5, bloons[l].y + 5, 25, 2, 22));
                    } else if(bloons[l].level === 2){
                        bloons.push(new Bloon(bloons[l].x - 5, bloons[l].y - 5, 15, 3, 12));
                        bloons.push(new Bloon(bloons[l].x + 5, bloons[l].y + 5, 15, 3, 12));
                    }
                    bloons.splice(l,1);
                    bullets.splice(m,1);
                    score += 20;

                    // Utilisé pour sortir des boucles parce que le splicing d'arrays
                    // en cours de bouclage se brisera autrement
                    break loop1;
                }
            }
        }
    }

    if(ship.visible){
        ship.Update();
        ship.Draw();
    }
    
    if (bullets.length !== 0) {
        for(let i = 0; i < bullets.length; i++){
            bullets[i].Update();
            bullets[i].Draw();
        }
    }
    if (bloons.length !== 0) {
        for(let j = 0; j < bloons.length; j++){
            bloons[j].Update();
            // Pass j so we can track which asteroid points
            // to store
            bloons[j].Draw(j);
        }
    }

    // Met à jour le high en utilisant un stockage local
    highScore = Math.max(score, highScore);
    localStorage.setItem(localStorageName, highScore);
    ctx.font = '21px Arial';
    ctx.fillText("HIGH SCORE : " + highScore.toString(), 20, 70);

    requestAnimationFrame(Render);
}
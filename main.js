const game = {
	oneAng: Math.PI/360,
	centerX: 640/2,
	centerY: 480/2,
	speed: 2,
	turretLength: 10,
	radius: 10,
	bulletSpeed: 5,
	bulletLength: 5,
	enemiRadii: [5,10,15],
	enemySpeeds: [1,0.5,0.25],
	enemyChance: 0.05,
	gameOver: false
};
const player = {
	ang: 0,
	lastMouseX: null,
	lastMouseY: null
};
let bullets = [];
let enemies = [];
const fireBullet = () => {
		bullets.push({
			ang: player.ang,
			distance: 0
		});
};

const addEnemy = (parent) => {
		const size = parent ? parent.size-1: 2;
		const enemy ={
			size,
			radius: game.enemiRadii[size],
			speed: game.enemySpeeds[size],
			ang: Math.random()*(Math.PI*2),
			distance: 400
		};
		enemy.x = parent? parent.x - Math.cos(enemy.ang)*parent.radius : Math.cos(enemy.ang)*(enemy.distance)+game.centerX;
		enemy.y = parent? parent.y - Math.sin(enemy.ang)*parent.radius : Math.sin(enemy.ang)*(enemy.distance)+game.centerY;
		enemies.push(enemy);
};

const killEnemy = (enemy, bullet) => {
		if (enemy.size>0) {
				addEnemy(enemy);
				addEnemy(enemy);
				enemies = enemies.filter(_en=>_en!==enemy);
		} else {
			if (bullet) {
				enemies = enemies.filter(_en=>_en!==enemy);
			} else {
				if (Math.random()>0.5) {
						enemies = enemies.filter(_en=>_en!==enemy);
				} else {
						enemy.ang = enemy.ang + Math.PI;
						enemy.x - Math.cos(enemy.ang)*enemy.radius
						enemy.y - Math.sin(enemy.ang)*enemy.radius
					}
			}
		}
		
}


document.onmousedown = e => {
				fireBullet();
};
document.onmousemove = e => {
	if (!player.lastMouseX) {
		player.lastMouseX = e.screenX;
		player.lastMouseY = e.screenY;
		return;
	}
	const delta = player.lastMouseY - e.screenY;
	if (delta>0) {
		player.ang-=game.oneAng*(game.speed*Math.abs(delta));
	} else if (delta<0){
		player.ang+=game.oneAng*(game.speed*Math.abs(delta));
	}
	player.lastMouseY = e.screenY;
};
setTimeout(() => {
		const ctx = document.getElementById("canvas").getContext('2d');
		window.ctx = ctx;
		const renderGameOver = () => {
			ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
			ctx.fillText("Game Over", 640/2 - 50, 480/2 - 10);
		}
		const render = () => {
				ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
				ctx.fillStyle = '#ff0000';

				// draw player
				const startX = Math.cos(player.ang)*game.radius+game.centerX;
				const startY = Math.sin(player.ang)*game.radius+game.centerY;
				const endX = Math.cos(player.ang)*(game.radius+game.turretLength)+game.centerX;
				const endY = Math.sin(player.ang)*(game.radius+game.turretLength)+game.centerY;

				ctx.beginPath();
    			ctx.lineWidth = 1;
    			ctx.strokeStyle = '#ff0000';
    			ctx.ellipse(game.centerX, game.centerY, game.radius, game.radius, 0, Math.PI*2, false);
				ctx.moveTo(startX, startY);
      			ctx.lineTo(endX, endY);

      			// draw+move+collision+remove bullets
      			const removeBullets = [];
      			bullets.forEach(bullet=> {
      				bullet.distance += game.bulletSpeed
      				const startX = Math.cos(bullet.ang)*(game.radius+bullet.distance)+game.centerX;
      				const startY = Math.sin(bullet.ang)*(game.radius+bullet.distance)+game.centerY;
      				const endX = Math.cos(bullet.ang)*(game.radius+bullet.distance+game.bulletLength)+game.centerX;
      				const endY = Math.sin(bullet.ang)*(game.radius+bullet.distance+game.bulletLength)+game.centerY;
      				ctx.moveTo(startX, startY);
      				ctx.lineTo(endX, endY);
      				if (startX<0 || startX>ctx.canvas.clientWidth || startY<0 || startY>ctx.canvas.clientHeight) {
      					removeBullets.push(bullet);
      					return;
      				}
      				for (let i=0; i<enemies.length; i++) {
      					const enemy = enemies[i];
      					const deltaX = Math.abs(enemy.x-startX);
      					const deltaY = Math.abs(enemy.y-startY);
      					if (deltaX<enemy.radius && deltaY<enemy.radius) {
      						removeBullets.push(bullet);
      						killEnemy(enemy, true);
      						break;
      					}
      				}
      			});
      			bullets = bullets.filter(bullet=>!removeBullets.includes(bullet));
				ctx.stroke();
				ctx.strokeStyle = '#000000';
      			// draw+move+collide enemies
      			const removeEnemies = [];
      			enemies.forEach(enemy=> {
      				enemy.x -= Math.cos(enemy.ang)*enemy.speed;
      				enemy.y -= Math.sin(enemy.ang)*enemy.speed;
      				const deltaX = Math.abs(enemy.x - game.centerX);
      				const deltaY = Math.abs(enemy.y - game.centerY);
      				const radius = Math.max(enemy.radius, game.radius);
      				if (enemy.x<-400 || enemy.x>ctx.canvas.clientWidth+400 || enemy.y<-400 || enemy.y>ctx.canvas.clientHeight+400) {
      					removeEnemies.push(enemy);
      					return;
      				}
      				if (deltaX<radius && deltaY<radius) {
      					game.gameOver = true;
      					console.log("game over");
      					return;
      				}
      				for (let i=0; i<enemies.length; i++) {
      					const _enemy = enemies[i];
      					if (_enemy===enemy) continue;
      					const deltaX = Math.abs(enemy.x-_enemy.x);
      					const deltaY = Math.abs(enemy.y-_enemy.y);
      					const radius = Math.max(enemy.radius, _enemy.radius);
      					if (deltaX<radius && deltaY<radius) {
      						killEnemy(enemy);
      						killEnemy(_enemy);
      						return;
      					}
      				}
      				ctx.beginPath();
      				ctx.ellipse(enemy.x, enemy.y, enemy.radius, enemy.radius, 0, Math.PI*2, false);
      				ctx.stroke();
      			});
				enemies = enemies.filter(enemy=>!removeEnemies.includes(enemy));
      			if (Math.random()<game.enemyChance) {
      				addEnemy();
      			}
      			if (!game.gameOver) {
					window.requestAnimationFrame(render);
				} else {
					window.requestAnimationFrame(renderGameOver);
				}
		};
		render();
}, 10);
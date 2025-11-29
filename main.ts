namespace SpriteKind {
    export const Wall = SpriteKind.create()
    export const EnemyBullet = SpriteKind.create()
}
/**
 * ---------- GLOBALS ----------
 */
/**
 * prev positions for wall collision revert
 */
/**
 * store previous enemy pos for maze-shooter collision
 */
// ---------- INPUT: menu navigation + unified A handler ----------
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (currentApp != App.Menu) {
        return
    }
    selected = (selected - 1 + menuItems.length) % menuItems.length
    drawMenu()
})
// ---------- GRID UTILS ----------
function gridToPixel (c: number, r: number) {
    // compute locally so no hidden globals required
    totalW = gridCols * CELL
    totalH = gridRows * CELL
    offsetXLocal = Math.floor((160 - totalW) / 2)
    offsetYLocal = Math.floor((120 - totalH) / 2)
    pxLocal = offsetXLocal + c * CELL + Math.floor(CELL / 2)
    pyLocal = offsetYLocal + r * CELL + Math.floor(CELL / 2)
    return [pxLocal, pyLocal]
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // back to menu from any game
    if (currentApp != App.Menu) {
        destroyAllKinds()
        currentApp = App.Menu
drawMenu()
    }
})
// ---------- MAZE: generation (recursive backtracker) ----------
function initMazeGrid () {
    mazeGrid = []
    for (let r = 0; r <= gridRows - 1; r++) {
        mazeGrid[r] = []
        for (let c = 0; c <= gridCols - 1; c++) {
            mazeGrid[r][c] = 0
        }
    }
}
// ---------- SHOOTER ----------
function startShooter () {
    destroyAllKinds()
    currentApp = App.Shooter
scene.setBackgroundColor(7)
    info.setScore(0)
    info.setLife(3)
    shooterEnemyHP = 3
    shooterPlayer = sprites.create(img`
        . 4 4 . 
        4 4 4 4 
        4 4 4 4 
        . 4 4 . 
        `, SpriteKind.Player)
    shooterPlayer.setPosition(20, 60)
    shooterPlayer.setStayInScreen(true)
    controller.moveSprite(shooterPlayer, 100, 100)
    shooterEnemy = sprites.create(img`
        . 2 2 . 
        2 2 2 2 
        2 2 2 2 
        . 2 2 . 
        `, SpriteKind.Enemy)
    shooterEnemy.setPosition(140, 60)
}
// player touches enemy
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (pl, en) {
    if (currentApp == App.Shooter) {
        info.changeLifeBy(-1)
        scene.cameraShake(4, 200)
        pause(300)
        if (info.life() <= 0) {
            game.over(false)
        }
    } else if (currentApp == App.ShooterMaze) {
        info.changeLifeBy(-1)
        scene.cameraShake(4, 200)
        pause(300)
        if (info.life() <= 0) {
            game.over(false)
        }
    }
})
// SINGLE A handler (menu select, shooter shoot, maze no-op)
// MAZE: A does nothing (could be used for auto-solve later)
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    // MENU select
    if (currentApp == App.Menu) {
        if (selected == 0) {
            startShooter()
            return
        } else if (selected == 1) {
            startMaze()
            return
        } else if (selected == 2) {
            // start the new maze shooter mode
            startMazeShooter()
            return
        } else {
            currentApp = App.ComingSoon
return
        }
    }
    // SHOOTER shooting
    if (currentApp == App.Shooter) {
        // cost
        info.changeScoreBy(-1)
        sprites.createProjectileFromSprite(img`
            . 1 .
            1 1 1
            . 1 .
        `, shooterPlayer, 160, 0)
return
    }
    // MAZE SHOOTER shooting (player shoots forward)
    if (currentApp == App.ShooterMaze) {
        info.changeScoreBy(-1)
        sprites.createProjectileFromSprite(img`
            . 1 .
            1 1 1
            . 1 .
        `, mazeShooterPlayer, 0, -120)
return
    }
})
function spawnMazeSprites () {
    for (let w of mazeWalls) {
        w.destroy()
    }
    mazeWalls = []
    for (let u = 0; u <= gridRows - 1; u++) {
        for (let f = 0; f <= gridCols - 1; f++) {
            if (mazeGrid[u][f] == 0) {
                p = gridToPixel(f, u)
                wallSprite = sprites.create(image.create(CELL, CELL), SpriteKind.Wall)
                wallSprite.image.fill(8)
                wallSprite.setPosition(p[0], p[1])
                wallSprite.setFlag(SpriteFlag.Ghost, false)
                mazeWalls.push(wallSprite)
            }
        }
    }
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (currentApp != App.Menu) {
        return
    }
    selected = (selected + 1) % menuItems.length
    drawMenu()
})
// ---------- SHOOTER MAZE (ADDED) ----------
function startMazeShooter () {
    destroyAllKinds()
    currentApp = App.ShooterMaze
scene.setBackgroundColor(6)
    info.setScore(0)
    info.setLife(7)
    mazeShooterEnemyHP = 1
    carveMaze()
    spawnMazeSprites()
    // player in maze shooter
    q = gridToPixel(1, 1)
    mazeShooterPlayer = sprites.create(img`
        . 4 4 . 
        4 4 4 4 
        4 4 4 4 
        . 4 4 . 
        `, SpriteKind.Player)
    mazeShooterPlayer.setPosition(q[0], q[1])
    controller.moveSprite(mazeShooterPlayer, 80, 80)
    mazeShooterPlayer.setStayInScreen(true)
    prevX = mazeShooterPlayer.x
    prevY = mazeShooterPlayer.y
    // enemy in maze shooter
    ePos = gridToPixel(gridCols - 2, gridRows - 2)
    mazeShooterEnemy = sprites.create(img`
        . 2 2 . 
        2 2 2 2 
        2 2 2 2 
        . 2 2 . 
        `, SpriteKind.Enemy)
    mazeShooterEnemy.setPosition(ePos[0], ePos[1])
    mazeShooterEnemyHP = 3
    // store enemy previous for wall collision
    mazeShooterPrevEnemyX = mazeShooterEnemy.x
    mazeShooterPrevEnemyY = mazeShooterEnemy.y
}
// ---------- collisions ----------
// NOTE: removed the Shooter branch here to avoid random damage in original Shooter.
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Player, function (proj, pl) {
    // projectile hitting player (enemy bullet)
    if (currentApp == App.ShooterMaze) {
        proj.destroy()
        info.changeLifeBy(-1)
        if (info.life() <= 0) {
            game.over(false)
        }
    }
})
// ---------- HELPERS ----------
function destroyAllKinds () {
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Wall)
    sprites.destroyAllSpritesOfKind(SpriteKind.EnemyBullet)
}
function carveMaze () {
    let stack: number[][] = []
    initMazeGrid()
    rr = 1
    cc = 1
    mazeGrid[rr][cc] = 1
    stack.push([rr, cc])
    while (stack.length > 0) {
        let neighborsLocal: number[][] = []
        topLocal = stack[stack.length - 1]
        t = topLocal[0]
        e = topLocal[1]
        if (t - 2 > 0 && mazeGrid[t - 2][e] == 0) {
            neighborsLocal.push([t - 2, e])
        }
        if (t + 2 < gridRows && mazeGrid[t + 2][e] == 0) {
            neighborsLocal.push([t + 2, e])
        }
        if (e - 2 > 0 && mazeGrid[t][e - 2] == 0) {
            neighborsLocal.push([t, e - 2])
        }
        if (e + 2 < gridCols && mazeGrid[t][e + 2] == 0) {
            neighborsLocal.push([t, e + 2])
        }
        if (neighborsLocal.length > 0) {
            nn = neighborsLocal[randint(0, neighborsLocal.length - 1)]
            nrLocal = nn[0]
            ncLocal = nn[1]
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            // remove wall between
            mazeGrid[(t + nrLocal) >> 1][(e + ncLocal) >> 1] = 1
            mazeGrid[nrLocal][ncLocal] = 1
            stack.push([nrLocal, ncLocal])
        } else {
            stack.pop()
        }
    }
}
// player reaches goal in normal maze
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    if (currentApp != App.Maze) {
        return
    }
    game.splash("TIME: " + mazeTimer + "s")
    if (mazeTimer < mazeBest) {
        mazeBest = mazeTimer
        settings.writeNumber("mazeBest", mazeBest)
game.splash("NEW RECORD!")
    }
    destroyAllKinds()
    currentApp = App.Menu
drawMenu()
})
// projectile hits enemy (player bullet)
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (proj, en) {
    if (currentApp == App.Shooter) {
        proj.destroy()
        shooterEnemyHP += -1
        music.pewPew.play()
        // refund
        info.changeScoreBy(1)
        if (shooterEnemyHP <= 0) {
            en.destroy(effects.disintegrate, 300)
            info.changeScoreBy(10)
            pause(200)
            // respawn enemy
            shooterEnemy = sprites.create(img`
                . 2 2 . 
                2 2 2 2 
                2 2 2 2 
                . 2 2 . 
                `, SpriteKind.Enemy)
            shooterEnemy.setPosition(140, randint(20, 100))
            shooterEnemyHP = 3
        }
    } else if (currentApp == App.ShooterMaze) {
        // projectile from player hits maze-shooter enemy
        proj.destroy()
        mazeShooterEnemyHP += -1
        music.pewPew.play()
        if (mazeShooterEnemyHP <= 0) {
            en.destroy(effects.disintegrate, 300)
            game.splash("YOU WIN!")
            destroyAllKinds()
            currentApp = App.Menu
drawMenu()
        }
    }
})
// ---------- START MAZE ----------
function startMaze () {
    destroyAllKinds()
    currentApp = App.Maze
scene.setBackgroundColor(6)
    mazeTimer = 0
    carveMaze()
    spawnMazeSprites()
    // place player at start (1,1)
    startPos = gridToPixel(1, 1)
    mazePlayer = sprites.create(img`
        . 7 7 . 
        7 7 7 7 
        7 7 7 7 
        . 7 7 . 
        `, SpriteKind.Player)
    mazePlayer.setPosition(startPos[0], startPos[1])
    controller.moveSprite(mazePlayer, 80, 80)
    mazePlayer.setStayInScreen(true)
    // place goal at opposite corner (gridRows-2, gridCols-2)
    exitR = gridRows - 2
    exitC = gridCols - 2
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    // make sure it's open
    mazeGrid[exitR][exitC] = 1
    exitPos = gridToPixel(exitC, exitR)
    mazeGoal = sprites.create(img`
        . 2 2 . 
        2 2 2 2 
        2 2 2 2 
        . 2 2 . 
        `, SpriteKind.Food)
    mazeGoal.setPosition(exitPos[0], exitPos[1])
    // record previous player pos for wall collision revert
    prevX = mazePlayer.x
    prevY = mazePlayer.y
}
// ---------- MENU DRAW ----------
function drawMenu () {
    scene.setBackgroundColor(9)
    screen.fill(9)
    screen.printCenter("MEWY OS", 10, 1)
for (let i = 0; i <= menuItems.length - 1; i++) {
        yy = 40 + i * 18
        if (i == selected) {
            // red selection rectangle (stroke)
            screen.drawRect(18, yy - 4, 124, 16, 2)
        }
        screen.print(menuItems[i], 30, yy, 1)
    }
    screen.printCenter("A = Select   B = Back", 110, 1)
// ONLY print BEST MAZE if it's a valid number (prevents "undefined")
    if (mazeBest != null && !(isNaN(mazeBest))) {
        screen.printCenter("BEST MAZE: " + mazeBest + "s", 100, 1)
    }
}
// enemy bullet hits player
sprites.onOverlap(SpriteKind.EnemyBullet, SpriteKind.Player, function (b, pl) {
    // Allow enemy bullets to hurt in both Shooter and ShooterMaze
    if (currentApp != App.Shooter && currentApp != App.ShooterMaze) {
        return
    }
    b.destroy()
    info.changeLifeBy(-1)
    scene.cameraShake(3, 200)
    if (info.life() <= 0) {
        game.over(false)
    }
})
let nonzero = 0
let projs: Sprite[] = []
let bullet: Sprite = null
let h: Sprite = null
let vy = 0
let vx = 0
let speed = 0
let mag = 0
let dy = 0
let dx = 0
let exitPos: number[] = []
let exitC = 0
let exitR = 0
let startPos: number[] = []
let nn: number[] = []
let topLocal: number[] = []
let cc = 0
let rr = 0
let mazeShooterPrevEnemyY = 0
let mazeShooterPrevEnemyX = 0
let ePos: number[] = []
let prevY = 0
let prevX = 0
let q: number[] = []
let wallSprite: Sprite = null
let p: number[] = []
let mazeWalls: Sprite[] = []
let mazeGrid: number[][] = []
let pyLocal = 0
let pxLocal = 0
let offsetYLocal = 0
let offsetXLocal = 0
let totalH = 0
let totalW = 0
let selected = 0
let gridRows = 0
let gridCols = 0
let CELL = 0
let yy = 0
let ncLocal = 0
let nrLocal = 0
let e = 0
let t = 0
let wall = null
let pos: number[] = []
let nc = 0
let nr = 0
let n: number[] = []
let d = 0
let s = 0
let top: number[] = []
let sc = 0
// some temporaries used in functions (kept to avoid missing-name errors)
let sr = 0
let mazeShooterEnemyHP = 0
let mazeShooterEnemy: Sprite = null
// maze-shooter globals (ADDED)
let mazeShooterPlayer: Sprite = null
let shooterEnemyHP = 0
let shooterEnemy: Sprite = null
// shooter globals (existing)
let shooterPlayer: Sprite = null
let mazeTimer = 0
let mazeGoal: Sprite = null
let mazePlayer: Sprite = null
let menuItems: string[] = []
CELL = 6
let MAZE_CELLS_X = 11
let MAZE_CELLS_Y = 7
gridCols = MAZE_CELLS_X * 2 + 1
gridRows = MAZE_CELLS_Y * 2 + 1
let mazeBest = settings.readNumber("mazeBest")
if (mazeBest == 0) {
    mazeBest = 9999
}
enum App {
    Boot,
    Menu,
    Shooter,
    Maze,
    ShooterMaze,
    ComingSoon
}
let currentApp = App.Boot
// ---------- BOOT (kept exactly like yours) ----------
scene.setBackgroundColor(1)
let logo = sprites.create(img`
    . . f f . . . . . . . . . f f . . 
    . . f 1 f . . . . . . . f 1 f . . 
    . . f 1 1 f . . . . . f 1 1 f . . 
    . . f 1 1 1 f f f f f 1 1 1 f . . 
    . . f 1 1 1 1 1 1 1 1 1 1 1 f . . 
    . f 1 1 1 1 1 1 1 1 1 1 1 1 1 f . 
    . f 1 1 f 9 1 1 1 1 1 f 9 1 1 f . 
    . f 1 1 f 9 1 1 1 1 1 f 9 1 1 f . 
    . f 1 1 1 1 1 1 1 1 1 1 1 1 1 f . 
    . f 1 1 1 1 1 1 3 1 1 1 1 1 1 f . 
    . . f 1 1 1 1 1 1 1 1 1 1 1 f . . 
    . . . f 1 1 1 1 1 1 1 1 1 f . . . 
    . . . . f f f f f f f f f . . . . 
    `, SpriteKind.Player)
logo.setPosition(80, 50)
logo.say("Mewy OS", 1200)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
mySprite.setPosition(80, 100)
mySprite.sayText("Powerd By: CocoKitten2016", 1200, false)
music.powerUp.play()
pause(1300)
sprites.destroy(mySprite)
logo.destroy()
// menu setup (kept/updated)
menuItems = [
"Shooter",
"Maze",
"Maze Shooter",
"Coming Soon"
]
currentApp = App.Menu
drawMenu()
game.onPaint(function () {
    if (currentApp == App.Menu) {
        drawMenu()
    } else if (currentApp == App.Shooter) {
        screen.printCenter("SHOOTER", 8, 1)
        screen.print("Enemy HP: " + shooterEnemyHP, 2, 2, 1)
        screen.print("Score:" + info.score(), 2, 12, 1)
    } else if (currentApp == App.Maze) {
        // HUD
        screen.print("TIME: " + mazeTimer + "s", 2, 2, 1)
        screen.print("BEST: " + mazeBest + "s", 2, 12, 1)

        // minimap box top-right
        let mapX = 110
        let mapY = 2
        let mapW = 46
        let mapH = 30
        screen.drawRect(mapX, mapY, mapW, mapH, 1)
        // draw player dot and goal dot scaled to map (scale positions)
        if (mazePlayer) {
            let px2 = mapX + Math.floor((mazePlayer.x / 160) * (mapW - 4)) + 1
            let py2 = mapY + Math.floor((mazePlayer.y / 120) * (mapH - 4)) + 1
            screen.fillRect(px2, py2, 2, 2, 7)
        }
        if (mazeGoal) {
            let gx = mapX + Math.floor((mazeGoal.x / 160) * (mapW - 4)) + 1
            let gy = mapY + Math.floor((mazeGoal.y / 120) * (mapH - 4)) + 1
            screen.fillRect(gx, gy, 2, 2, 2)
        }
    } else if (currentApp == App.ShooterMaze) {
        screen.print("Maze Shooter", 2, 2, 1)
        screen.print("Enemy HP: " + mazeShooterEnemyHP, 2, 12, 1)
        screen.print("Score:" + info.score(), 2, 22, 1)
    } else if (currentApp == App.ComingSoon) {
        screen.fill(9)
        screen.printCenter("COMING SOON", 60, 2)
        screen.printCenter("Press B", 90, 1)
    }
})
// prevent enemy walking through walls by reverting to previous pos
game.onUpdate(function () {
    if (currentApp != App.ShooterMaze) {
        return
    }
    if (!(mazeShooterEnemy)) {
        return
    }
    for (let g of mazeWalls) {
        if (mazeShooterEnemy.overlapsWith(g)) {
            mazeShooterEnemy.setPosition(mazeShooterPrevEnemyX, mazeShooterPrevEnemyY)
            break;
        }
    }
})
// ---------- GAME UPDATE / WALL COLLISIONS ----------
// store previous position for player in Maze and ShooterMaze
game.onUpdate(function () {
    if (currentApp == App.Maze && mazePlayer) {
        prevX = mazePlayer.x
        prevY = mazePlayer.y
    } else if (currentApp == App.ShooterMaze && mazeShooterPlayer) {
        prevX = mazeShooterPlayer.x
        prevY = mazeShooterPlayer.y
    }
})
// ---------- MAZE-SHOOTER: ENEMY SHOOTING ----------
game.onUpdateInterval(1000, function () {
    if (currentApp != App.ShooterMaze) {
        return
    }
    if (!(mazeShooterEnemy) || !(mazeShooterPlayer)) {
        return
    }
    // shoot towards player - scale velocity to speed (80)
    dx = mazeShooterPlayer.x - mazeShooterEnemy.x
    dy = mazeShooterPlayer.y - mazeShooterEnemy.y
    mag = Math.sqrt(dx * dx + dy * dy)
    speed = 80
    if (mag > 0) {
        vx = Math.round(dx / mag * speed)
        vy = Math.round(dy / mag * speed)
    }
    h = sprites.createProjectileFromSprite(img`
        . 1 . 
        1 1 1 
        . 1 . 
        `, mazeShooterEnemy, vx, vy)
    h.setKind(SpriteKind.EnemyBullet)
})
// maze timer
game.onUpdateInterval(1000, function () {
    if (currentApp == App.Maze) {
        mazeTimer += 1
    }
})
// every 20ms check player overlap with walls and revert if needed
game.onUpdateInterval(20, function () {
    if (currentApp == App.Maze && mazePlayer) {
        for (let a of mazeWalls) {
            if (mazePlayer.overlapsWith(a)) {
                mazePlayer.setPosition(prevX, prevY)
                return
            }
        }
    } else if (currentApp == App.ShooterMaze && mazeShooterPlayer) {
        for (let b of mazeWalls) {
            if (mazeShooterPlayer.overlapsWith(b)) {
                mazeShooterPlayer.setPosition(prevX, prevY)
                return
            }
        }
    }
})
// ---------- ORIGINAL SHOOTER: ENEMY SHOOTING (ADDED) ----------
game.onUpdateInterval(900, function () {
    if (currentApp != App.Shooter) {
        return
    }
    if (!(shooterEnemy) || !(shooterPlayer)) {
        return
    }
    dx = shooterPlayer.x - shooterEnemy.x
    dy = shooterPlayer.y - shooterEnemy.y
    mag = Math.sqrt(dx * dx + dy * dy)
    if (mag == 0) {
        return
    }
    speed = 90
    vx = Math.round(dx / mag * speed)
    vy = Math.round(dy / mag * speed)
    bullet = sprites.createProjectileFromSprite(img`
        . 5 . 
        5 5 5 
        . 5 . 
        `, shooterEnemy, vx, vy)
    bullet.setKind(SpriteKind.EnemyBullet)
    music.zapped.play()
})
// ---------- FIX: make invisible enemy bullets visible in ORIGINAL SHOOTER ----------
// This runs only during the normal Shooter mode and replaces fully-transparent projectile images
game.onUpdateInterval(100, function () {
    if (currentApp != App.Shooter) {
        return
    }
    projs = sprites.allOfKind(SpriteKind.Projectile)
    for (let v of projs) {
        let j = v.image.width
let k = v.image.height
for (let yy2 = 0; yy2 <= k - 1; yy2++) {
            for (let xx = 0; xx <= j - 1; xx++) {
                if (v.image.getPixel(xx, yy2) != 0) {
                    nonzero += 1
                }
            }
        }
        if (nonzero == 0) {
            // replace invisible image with a small visible bullet (keeps same vx/vy)
            v.setImage(img`
                . 2 . 
                2 2 2 
                . 2 . 
                `)
        }
    }
})
// ---------- MAZE-SHOOTER: ENEMY CHASE + WALL COLLISION ----------
game.onUpdateInterval(300, function () {
    if (currentApp != App.ShooterMaze) {
        return
    }
    if (!(mazeShooterEnemy) || !(mazeShooterPlayer)) {
        return
    }
    // store previous enemy pos for wall collision safety
    mazeShooterPrevEnemyX = mazeShooterEnemy.x
    mazeShooterPrevEnemyY = mazeShooterEnemy.y
    // chase player
    mazeShooterEnemy.vx = mazeShooterPlayer.x < mazeShooterEnemy.x ? -30 : 30
    mazeShooterEnemy.vy = mazeShooterPlayer.y < mazeShooterEnemy.y ? -30 : 30
})
// enemy chase for normal shooter (kept)
game.onUpdateInterval(200, function () {
    if (currentApp != App.Shooter) {
        return
    }
    if (!(shooterEnemy) || !(shooterPlayer)) {
        return
    }
    shooterEnemy.vx = shooterPlayer.x < shooterEnemy.x ? -40 : 40
    shooterEnemy.vy = shooterPlayer.y < shooterEnemy.y ? -40 : 40
})

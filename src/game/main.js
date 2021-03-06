/**
 *
 * This is a simple state template to use for getting a Phaser game up
 * and running quickly. Simply add your own game logic to the default
 * state object or delete it and make your own.
 *
 */

var state = {
    collisionLayer: null,
    propLayer: null,
    coins: null,
    player: null,
    slimes: null,
    flies: null,
    cursors: null,
    scoreText: null,
    liquids: null,
    score: 0,
    updateCounter: 0,

    initWorld: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 7000, 700);

        map = game.add.tilemap('level1');
        map.addTilesetImage('levelTileset');
        map.setCollisionByExclusion([0]);
        collisionLayer = map.createLayer('activeLayer');
        propLayer = map.createLayer('propLayer')
        collisionLayer.resizeWorld();

        liquids = game.add.group();
        liquids.enableBody = true;

        var lava = liquids.create(3292, game.world.height - 170, 'lava');
        lava.scale.setTo(4, 4);
        lava.body.immovable = true;
    },

    initCoins: function() {
        coins = game.add.group();
        coins.enableBody = true;

        var i, coin;
        for (i = 0; i < 30; i += 1) {
            coin = coins.create(i * 200 + Math.random() * 500, 0, 'coinGold');
            coin.body.gravity.y = 1000;
            coin.body.bounce.y = 0.5 + Math.random() * 0.2;
            coin.body.collideWorldBounds = true;
        }
    },

    initPlayer: function() {
        player = game.add.sprite(32, game.world.height - 260, 'hero', 'front');
        game.physics.arcade.enable(player);
        player.body.bounce.y = 0.0;
        player.body.gravity.y = 600;
        player.body.collideWorldBounds = true;

        player.animations.add('walkLeft', Phaser.Animation.generateFrameNames('walkLeft', 1, 11, '', 4), 30, true);

        player.animations.add('walkRight', Phaser.Animation.generateFrameNames('walkRight', 1, 11, '', 4), 30, true);

        player.animations.add('front', ['front'], 1, true);
        player.animations.add('jumpLeft', ['jumpLeft'], 1, true);
        player.animations.add('jumpRight', ['jumpRight'], 1, true);

        game.camera.follow(player);
    },

    initCritters: function() {
        slimes = game.add.group();
        slimes.enableBody = true;

        var slime;
        for (i = 0; i < 20; i += 1) {
            slime = slimes.create(i * 300 + Math.random() * 200, 0, 'slime');
            slime.body.gravity.y = 300;
            slime.body.bounce.y = 0;
            slime.body.collideWorldBounds = true;
            slime.animations.add('moveLeft', ['moveLeft'], 1, true);
            slime.animations.add('moveRight', ['moveRight'], 1, true);
            slime.animations.add('dead', ['dead'], 1, true);
            slime.dead = false;
        }

        flies = game.add.group();
        flies.enableBody = true;

        var fly;
        for (i = 0; i < 10; i += 1) {
            fly = flies.create(i * 500 + Math.random() * 200, Math.random() * 600, 'fly', 'flyLeft1');
            fly.body.bounce.y = 0;
            fly.body.collideWorldBounds = true;
            fly.animations.add('flyLeft', ['flyLeft1', 'flyLeft2'], 10, true);
            fly.animations.add('flyRight', ['flyRight1', 'flyRight2'], 10, true);
            fly.animations.add('dead', ['flyDead'], 1, true);
            fly.dead = false;
        }
    },

    collectCoin: function(player, coin) {
        coin.kill();
        this.score += 10;
        scoreText.text = 'Score: ' + this.score;
    },

    killHero: function(player) {
        player.x = 32;
        player.y = game.world.height - 280;   
        this.score = 0;
        scoreText.text = 'Score: ' + this.score;
    },

    isOnTop: function(e1, e2) {
        if (e1.y + e1.height - 10 < e2.y) {
            return true;
        }
        return false;
    },

    destroyObject: function(object, bla) {
        object.kill();
    },

    killCritter: function(player, critter) {
        critter.dead = true;
        critter.body.velocity.x = 0;
        critter.body.velocity.y = 0;
        critter.body.gravity.y = 10000;

        critter.animations.play('dead');
        game.time.events.add(Phaser.Timer.SECOND * 5, critter.destroy, critter);

        this.score += 100;
        scoreText.text = 'Score: ' + this.score;
    },

    handleCollisions: function() {
        game.physics.arcade.collide(player, collisionLayer);
        game.physics.arcade.collide(coins, collisionLayer);
        game.physics.arcade.overlap(player, coins, this.collectCoin, null, this);
        game.physics.arcade.collide(slimes, collisionLayer);
        game.physics.arcade.collide(flies, collisionLayer);
        game.physics.arcade.overlap(player, flies, this.killCritter, function(player, critter) {
                if (critter.dead) return false;
                return this.isOnTop(player, critter);
            }, this);
        game.physics.arcade.overlap(player, flies, this.killHero, function(player, critter) {
                if (critter.dead) return false;
                return (!this.isOnTop(player, critter));
            }, this);

        game.physics.arcade.overlap(player, slimes, this.killCritter, function(player, critter) {
                if (critter.dead) return false;
                return this.isOnTop(player, critter);
            }, this);
        game.physics.arcade.overlap(player, slimes, this.killHero, function(player, critter) {
                if (critter.dead) return false;
                return (!this.isOnTop(player, critter));
            }, this);

        game.physics.arcade.overlap(player, liquids, this.killHero, null, this);
        game.physics.arcade.overlap(coins, liquids, this.destroyObject, null, this);
        game.physics.arcade.overlap(flies, liquids, this.destroyObject, null, this);
        game.physics.arcade.overlap(slimes, liquids, this.destroyObject, null, this);
    },

    handlePlayerInput: function() {
        player.body.velocity.x = 0;

        if (cursors.left.isDown) {
            player.body.velocity.x = -450;
            if (player.body.onFloor()) {
                player.animations.play('walkLeft');
            } else {
                player.animations.play('jumpLeft');
            }
        } else if (cursors.right.isDown) {
            player.body.velocity.x = 450;
            if (player.body.onFloor()) {
                player.animations.play('walkRight');
            } else {
                player.animations.play('jumpRight');
            }
        } else {
            if (player.body.onFloor()) {
                player.animations.stop(null, true);
                player.animations.play('front');
            }
        }

        if (cursors.up.isDown && player.body.onFloor()) {
            player.animations.play('jumpRight');
            player.body.velocity.y = -700;
        }
    },

    animateSlime: function(slime, time) {
        slime.body.velocity.x = 0;
        if (slime.dead) {
            return;
        }
        if (time % 300 < 150) {
            slime.body.velocity.x = 150;
            slime.animations.play('moveRight');
        } else {
            slime.body.velocity.x = -150;
            slime.animations.play('moveLeft');
        }
    },

    animateFly: function(fly, time) {
        fly.body.velocity.x = 0;
        fly.body.velocity.y = 0;
        if (fly.dead) {
            return;
        }

        var magic = time % 500;
        if (magic  < 250) {
            fly.body.velocity.x = 150;
            fly.animations.play('flyRight');
        } else {
            fly.body.velocity.x = -150;
            fly.animations.play('flyLeft');
        }
        if (magic * Math.random() < 20) {
            fly.body.velocity.y = -150;
        } else if (magic * Math.random() < 40) {
            fly.body.velocity.y = 150;
        } else {
            fly.body.velocity.y = 0;
        }
    },

    preload: function() {
        game.stage.backgroundColor = '#80E0ED'
        game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('levelTileset', 'assets/kennieTileset.png');
        game.load.image('lava', 'assets/lava.png');
        game.load.image('coinGold', 'assets/coinGold.png');
        game.load.atlasJSONHash('slime', 'assets/slime.png', 'assets/slime.json');
        game.load.atlasJSONHash('hero', 'assets/hero.png', 'assets/hero.json');
        game.load.atlasJSONHash('fly', 'assets/fly.png', 'assets/fly.json');
    },
    create: function(){
        this.initWorld();
        this.initCoins();
        this.initPlayer();
        this.initCritters();

        cursors = game.input.keyboard.createCursorKeys();

        scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        scoreText.fixedToCamera = true;
    },
    update: function() {
        this.handleCollisions();
        this.handlePlayerInput();

        slimes.forEachAlive(this.animateSlime, this, this.updateCounter);
        flies.forEachAlive(this.animateFly, this, this.updateCounter);

        game.world.wrap(player, 0, false, true, false);
        this.updateCounter += 1;
    }
};

var game = new Phaser.Game(
    960,
    640,
    Phaser.AUTO,
    'game',
    state
);
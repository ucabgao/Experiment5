'use strict';

const game = window.game;

const Gus = require('./gus');
const GhostGirderMarker = require('./ghostGirderMarker');
const ParticleBurst = require("../particles/burst");

const COLLISION_GROUPS = require("../consts/collisionGroups");
const EPSILON = require("../consts").EPSILON;
const TAU = require("../consts").TAU;

class GhostGus extends Gus {
  constructor(x, y) {
    super(x, y, false);
    this.sprite.alpha = 0.5;

    this.startTime = game.time.now + 500;
    this.timingTolerance = -20; // in ms


    this.inputRecords = [{"INPUT":[2],"ENDTIME":2551},{"INPUT":[0],"ENDTIME":2234},{"INPUT":[2],"ENDTIME":1967},{"INPUT":[0],"ENDTIME":1867},{"INPUT":[2],"ENDTIME":1651},{"INPUT":[2,3],"ENDTIME":1167},{"INPUT":[2],"ENDTIME":1050},{"INPUT":[0],"ENDTIME":750}]


    this.currentInputRecord = this.inputRecords.pop();
    this.currentInputRecord.hasBeenExecuted = false;

    this.courseCorrectionRecords = [{"X":2620.02197265625,"Y":205.25314331054688,"TIME":4935},{"X":2271.2368774414062,"Y":205.43609619140625,"TIME":4752},{"X":1948.2009887695312,"Y":205.61904907226562,"TIME":4569},{"X":1651.4164733886719,"Y":205.802001953125,"TIME":4385},{"X":1381.3955688476562,"Y":205.98495483398438,"TIME":4202},{"X":1138.659896850586,"Y":206.16790771484375,"TIME":4018},{"X":923.7417602539062,"Y":206.35086059570312,"TIME":3835},{"X":737.1836090087891,"Y":206.5338134765625,"TIME":3651},{"X":579.53857421875,"Y":206.71676635742188,"TIME":3468},{"X":451.3704299926758,"Y":206.89971923828125,"TIME":3285},{"X":353.2542037963867,"Y":207.08267211914062,"TIME":3101},{"X":285.7760429382324,"Y":207.265625,"TIME":2918},{"X":249.53353881835938,"Y":207.44857788085938,"TIME":2734},{"X":245.1358985900879,"Y":207.63153076171875,"TIME":2551},{"X":273.20423126220703,"Y":253.38443756103516,"TIME":2368},{"X":223.79985809326172,"Y":282.54981994628906,"TIME":2184},{"X":194.81931686401367,"Y":282.73277282714844,"TIME":2001},{"X":192.26425170898438,"Y":307.65846252441406,"TIME":1817},{"X":194.67439651489258,"Y":311.8110656738281,"TIME":1634},{"X":198.11838150024414,"Y":320.1131057739258,"TIME":1450},{"X":198.4518051147461,"Y":320.11505126953125,"TIME":1267},{"X":204.82763290405273,"Y":320.38673400878906,"TIME":1084},{"X":165.2175521850586,"Y":320.1947021484375,"TIME":900},{"X":128.00000190734863,"Y":320.16666412353516,"TIME":717},{"X":128.00000190734863,"Y":320.16693115234375,"TIME":550},{"X":128.00000190734863,"Y":320.17547607421875,"TIME":317}];

    this.currentCourseCorrectionRecord = this.courseCorrectionRecords.pop();

    this.setCollision();

    this.marker = new GhostGirderMarker();
    this.marker.setMaster(this);

    console.log('Ghost Gus (a.k.a girder ghost) created.')
  }

  correctCourse() {
    this.sprite.body.x = this.currentCourseCorrectionRecord.X;
    this.sprite.body.y = this.currentCourseCorrectionRecord.Y;

    if (this.courseCorrectionRecords.length)
      this.currentCourseCorrectionRecord = this.courseCorrectionRecords.pop();
  }

  evaluateInputRecord() {

    if (this.currentInputRecord) {

      if (this.isRecordExpired() && this.currentInputRecord.hasBeenExecuted) {
        this.currentInputRecord = this.inputRecords.pop();
      }

      if (!this.currentInputRecord) return;

      this.currentInputRecord.INPUT.forEach(action => {
        switch (action) {
          case 1:
            this.walk('left');
            break;
          case 2:
            this.walk('right');
            break;
          case 3:
            this.marker.placeGirder();
            break;
          default:
            this.stop();
            break;
        }
      });

      this.currentInputRecord.hasBeenExecuted = true;
    }
  }

  getTime() {
    return game.time.now - this.startTime;
  }

  isRecordExpired() {
    const currentTime = this.getTime();
    const currentInputRecordEnd = this.currentInputRecord.ENDTIME;

    return currentTime >= currentInputRecordEnd - this.timingTolerance;
  }

  // diff from Gus's doom: doesn't unlock the dolly
  doom() {

    this.sprite.body.clearCollision();
    this.sprite.body.fixedRotation = false;

    this.sprite.body.velocity.x = Math.sin(this.rotation) * 250;
    this.sprite.body.velocity.y = Math.cos(this.rotation) * -250;

    this.sprite.body.angularVelocity = 30;
    //this.sprite.body.rotateRight( 360 );

  }

  setCollision() {
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SOLID);
    this.sprite.body.setCollisionGroup(COLLISION_GROUPS.GHOST_PLAYER_SENSOR, this.rotationSensor);
    this.sprite.body.collides([COLLISION_GROUPS.GHOST_BLOCK_ROTATE, COLLISION_GROUPS.BLOCK_SOLID, COLLISION_GROUPS.BLOCK_ROTATE, COLLISION_GROUPS.SPIKES]);
  }

  update() {
    if (Math.abs(Math.cos(this.rotation)) > EPSILON) this.sprite.body.velocity.x = 0;
    else this.sprite.body.velocity.y = 0;
    this.evaluateInputRecord();


    // check to see if we're rotating
    if (this.rotating) {
      // stop all movement
      this.stop();
      this.sprite.body.velocity.y = 0;
      this.sprite.body.velocity.x = 0;

      // create a rotate tween
      if (this.rotateTween === undefined) {
        this.rotateTween = game.add.tween(this.sprite).to({
            rotation: this.targetRotation
          }, 300, Phaser.Easing.Default, true)
          .onComplete.add(function() {
            this.rotation = this.targetRotation % (TAU); // keep angle within 0-2pi
            this.finishRotation();
          }, this);
      }

    } else if (!this.isDead) {

      // do gravity
      this.applyGravity();

      if (this.rotationSensor.needsCollisionData) {
        this.setCollision();
        this.rotationSensor.needsCollisionData = false;
      }

      this.marker.update()

      if (!this.isTouching("down")) {
        this.fallTime += game.time.physicsElapsedMS;

        if (this.fallTime > this.killTime) {
          this.kill();
        }

      } else {
        this.fallTime = 0;
      }

    }


    // course correction
    if (this.getTime() >= this.currentCourseCorrectionRecord.TIME) {
      this.correctCourse();
    }

  }
}

module.exports = GhostGus;

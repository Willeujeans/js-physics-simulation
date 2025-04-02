import { gamer } from './physics_object.js';

var playSpace = document.getElementById("PlaySpace");


function random_int_range(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Vector2 {
    x = 0.0;
    y = 0.0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

var old_time = 0.0;
var delta = 0.0;
class physics_server {
    physics_layers = [[], []];
    delta = 0.0;

    constructor() {
        this.physics_loop();
    }

    physics_loop(delta, time, old_time, physics_layers) {
        console.log("loop");
        delta = (time - old_time) / 1000;
        old_time = time;

        move_bodies(delta, time, old_time, physics_layers);
        collision_check(delta, time, old_time, physics_layers);

        setTimeout(() => {
            this.physics_loop(delta, time, old_time, physics_layers);
        }, 100);
        // window.requestAnimationFrame(this.physics_loop);
    }

    move_bodies(delta, time, old_time, physics_layers) {
        for (var layer = 0; layer < this.physics_layers.length; layer++) {
            for (let i = 0; i < this.physics_layers[layer].length; i++) {
                var body_to_move = this.physics_layers[layer][i];
                body_to_move.move(delta);
            }
        }
    }

    collision_check() {
        for (var layer = 0; layer < this.physics_layers.length; layer++) {
            for (let i = 0; i < this.physics_layers[layer].length; i++) {
                var body_a = this.physics_layers[layer][i];
                for (let j = 0; j < this.physics_layers[layer].length; j++) {
                    var body_b = this.physics_layers[layer][j];
                    this.colliding_bodies_check(body_a, body_b);
                }
            }
        }
    }

    colliding_bodies_check(body_a, body_b) {
        var is_colliding = false;

        for (var i = 0; i < this.physics_layers[layer].length; i++) {
            for (var j = 0; j < this.physics_layers[layer].length; j++) {
                if (this.is_intersecting_rectangular(this.physics_layers[0][i])) {

                }
            }
        }
        if (is_colliding) {
            this.visual_body.classList.add("colliding");
        } else {
            this.visual_body.classList.remove("colliding");
        }
    }

}


class physics_object {
    // Constants
    constant_linear_velocity = new Vector2(0.0, 0.0);
    constant_angular_velocity = 0.0;
    rotation_limit = 0.0;
    gravity = 0.0;
    physics_layer = 0;
    visual_body = null;
    visual_arrow = null;

    // Current State
    rotation = 0.0;
    position = new Vector2(0.0, 0.0);
    linear_velocity = new Vector2(0.0, 0.0);

    current_state = 0;

    constructor(position) {
        this.position.x = position.x;
        this.position.y = position.y;

        this.visual_body = document.createElement("div");
        this.visual_body.classList.add("joint");
        playSpace.appendChild(this.visual_body);
        this.visualize_vector();
    }

    visualize_vector() {
        this.visual_arrow = document.createElement("div");
        this.visual_arrow.classList.add("arrow");
        playSpace.appendChild(this.visual_arrow);
    }

    physics_process(delta) {
        this.current_state = 1;
        this.move(delta);
        this.collision_check();
        this.queue_free();
    }

    move(delta) {
        this.linear_velocity.y += this.gravity;
        this.position.x += this.linear_velocity.x * delta;
        this.position.y += this.linear_velocity.y * delta;
    }

    collision_check() {
        var is_colliding = false;
        if (this.physics_layers[0].length > 1) {
            for (let i = 0; i < this.physics_layers[0].length; i++) {
                if (this.physics_layers[0][i] != this) {
                    if (this.is_intersecting_rectangular(this.physics_layers[0][i])) {
                        this.handle_collision_forces(this.physics_layers[0][i]);
                        is_colliding = true;
                    }
                }
            }
        }
        if (is_colliding) {
            this.visual_body.classList.add("colliding");
        } else {
            this.visual_body.classList.remove("colliding");
        }
    }

    handle_collision_forces(body) {
        var collision_vector = new Vector2(body.position.x - this.position.x, body.position.y - this.position.y);
        var distance_between_bodies = Math.sqrt((body.position.x - this.position.x) * (body.position.x - this.position.x) + (body.position.y - this.position.y) * (body.position.y - this.position.y));
        var collision_vector_normalized = new Vector2(collision_vector.x / distance_between_bodies, collision_vector.y / distance_between_bodies);
        var vector_relative_velocity = new Vector2(this.linear_velocity.x - body.linear_velocity.x, this.linear_velocity.y - body.linear_velocity.y);
        var speed = vector_relative_velocity.x * collision_vector_normalized.x + vector_relative_velocity.y * collision_vector_normalized.y;
        if (speed >= 0) {
            console.log(this, "SETTING");
            this.linear_velocity.x -= (speed * collision_vector_normalized.x);
            this.linear_velocity.y -= (speed * collision_vector_normalized.y);

            body.linear_velocity.x -= (speed * collision_vector_normalized.x);
            body.linear_velocity.y -= (speed * collision_vector_normalized.y);
        }
    }

    is_intersecting_rectangular(physics_object) {
        var self_hitbox = this.visual_body.getBoundingClientRect();
        var other_hitbox = physics_object.visual_body.getBoundingClientRect();

        var horizontalOverlap =
            self_hitbox.left < other_hitbox.right
            && self_hitbox.right > other_hitbox.left;

        var verticalOverlap =
            self_hitbox.top < other_hitbox.bottom
            && self_hitbox.bottom > other_hitbox.top;

        var isColliding = horizontalOverlap && verticalOverlap;
        return isColliding;
    }

    is_intersecting_circular(physics_object) {
        var x_difference = this.position.x - physics_object.position.x;
        var y_difference = this.position.y - physics_object.position.y;
        var square_distance = (x_difference * x_difference) + (y_difference * y_difference);

        var self_radius = this.visual_body.getBoundingClientRect().width / 2;
        var other_radius = physics_object.visual_body.getBoundingClientRect().width / 2;
        var combined_radius = ((self_radius + other_radius) * (self_radius + other_radius))
        var is_circle_overlap = square_distance <= combined_radius;

        return is_circle_overlap;
    }

    update_visual() {
        this.current_state = 2;
        this.visual_body.style.left = (this.position.x - (this.visual_body.offsetHeight / 2)) + "px";
        this.visual_body.style.top = (this.position.y - (this.visual_body.offsetHeight / 2)) + "px";

        this.visual_arrow.style.left = this.position.x + this.linear_velocity.x + "px";
        this.visual_arrow.style.top = this.position.y + this.linear_velocity.y + "px";
    }

    queue_free() {
        if (this.current_state == -1) {
            this.visual_arrow.remove();
            this.visual_body.remove();
            delete this;
        }
    }
}


function spawn_joint(event) {
    var new_joint = new physics_object(new Vector2(event.x, event.y), false, 0.0);
    new_joint.linear_velocity.x = random_int_range(-100.0, 100.0);
    new_joint.linear_velocity.y = random_int_range(-100.0, 100.0);
}


function window_resized(event) {
    playSpace.style.width = window.innerHeight + "px";
}


// function main() {
//     playSpace.style.width = window.innerHeight + "px";
//     window.addEventListener("resize", window_resized);
//     playSpace.addEventListener("click", spawn_joint);
//     var my_physics_server = new physics_server();
// }


// main();

gamer();

// SCREAMING_SNAKE
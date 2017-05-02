/**
 * @fileoverview
 * Different user objects representing different kind of users for testing
 * purposes. The password for all these users is '123456'.
 *
 * @summary user fixtures
 * @module ./user.js
 * @export admin
 * @export verified
 * @export nonVerified
 * @export softDeleted
 * @export banned
 * @author Mario Moro Hernández
 * @license None
 * @version 0.0.alpha
 */

module.exports = {
    admin: {
	firstName: "John",
	lastName: "Doe",
	userName: "admin",
	email: "admin@elputoamo.com",
	encryptedPassword:  "$2a$10$bzMEjvt9ks0fL0pf2qqWZej3XyusAnjbpKxDqkQq76C6Ws8pX5gBG",
	admin: true,
	deleted: false,
	banned: false,
	verified: true
	
    },
    verified: {
	firstName: "Miguel",
	lastName: "Baez",
	userName: "eltripi",
	email: "verified@piltrafilla.es",
	encryptedPassword: "$2a$10$PMa0gdvQ.zcd/4bL6VWITOkhY0FOzxiJuWafWUX.YQKtDnEH3vv9O",
	admin: false,
	deleted: false,
	banned: false,
	verified: true
    },
    nonVerified: {
	firstName: "Turulo",
	lastName: "Romero",
	userName: "elpollito",
	email: "nonverified@piltrafilla.es",
	encryptedPassword: "$2a$10$Di9bag/ZKflMxonBYyguAOWadPXhztRmRUsUXX4.B1BWUE142N2W2",
	admin: false,
	deleted: false,
	banned: false,
	verified: false
    },
    softDeleted: {
	firstName: "Farlopo",
	lastName: "Linares",
	userName: "perico",
	email: "softdeleted@piltrafilla.es",
	encryptedPassword: "$2a$10$8yHdY23tFBpuCBKZs9mmWutyG.xjXMImILd5PRuqvY2UM7Kd8h5Oi",
	admin: false,
	deleted: true,
	banned: false,
	verified: true
    },
    banned: {
	firstName: "Enrique",
	lastName: "Ponte",
	userName: "turulodeoro",
	email: "banned@piltrafilla.es",
	encryptedPassword: "$2a$10$3UnHsOClDVrBpB0UUQ6WfutwAXNxnmGsa7/emvxPtlTqK.g8GUX2u",
	admin: false,
	deleted: false,
	banned: true,
	verified: true
    }
};

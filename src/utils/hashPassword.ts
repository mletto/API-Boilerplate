
const bcrypt = require('bcrypt');

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, salt);
}
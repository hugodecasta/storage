'use strict'

// ---------------------------------------------------- IMPORTS

let fs = require('fs')
let crypto = require('crypto')

// ---------------------------------------------------- VARS

const encrypt_algorithm = 'aes-256-cbc';
const hash_algorithm = 'RIPEMD160'
const iv = 'couucouucouucouu';

// ---------------------------------------------------- CORE

function encrypt(data, hkey) {
    let cipher = crypto.createCipheriv(encrypt_algorithm, Buffer.from(hkey), iv)
    let crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    return crypted;
}

function decrypt(data, hkey) {
    let decipher = crypto.createDecipheriv(encrypt_algorithm, Buffer.from(hkey), iv)
    let decoded = decipher.update(data, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
}

function hash(text) {
    let hasher = crypto.createHash(hash_algorithm)
    hasher.update(text)
    return hasher.digest('hex').substr(0,32)
}

// ---------------------------------------------------- FILE MANAGER

function key_to_hash(key) {
    return hash('aibstract'+key+'storage');
}

// ---------------------------------------------------- INNER

class Storage {

    constructor(data_dir) {
        this.data_dir = data_dir

        if(!fs.existsSync(data_dir)) {
            var shell = require('shelljs')
            shell.mkdir('-p', data_dir);
        }
    }

    hkey_to_filename(hkey) {
        let hashfile = hash('hkey'+hkey+'tofilename')
        return this.data_dir+'/'+hashfile
    }

    read_key(key) {
        let hkey = key_to_hash(key)
        let filename = this.hkey_to_filename(hkey)
        if(!fs.existsSync(filename)) {
            return null
        }
        let file_data = fs.readFileSync(filename,'binary')
        let decrypt_file_data = decrypt(file_data, hkey)
        return JSON.parse(decrypt_file_data)
    }
    
    write_key(key, file_data) {
        let hkey = key_to_hash(key)
        let filename = this.hkey_to_filename(hkey)
        file_data = JSON.stringify(file_data)
        let encrypted_data = encrypt(file_data, hkey)
        fs.writeFileSync(filename, encrypted_data,'binary')
        return true
    }
    
    remove_key(key) {
        let hkey = key_to_hash(key)
        let filename = this.hkey_to_filename(hkey)
        if(!fs.existsSync(filename)) {
            return null
        }
        fs.unlinkSync(filename)
        return true
    }
    
    key_exists(key) {
        let hkey = key_to_hash(key)
        let filename = this.hkey_to_filename(hkey)
        return fs.existsSync(filename)
    }

}

// ---------------------------------------------------- EXPORTS

module.exports = exports.Storage = Storage

import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

export async function hashPassword(plainPassword: string): Promise<string> {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS)
        return hashedPassword
    } catch (error) {
        console.error('Error while hashing password:', error)
        throw new Error('Error while hashing password')
    }
}

export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
        return isMatch
    } catch (error) {
        console.error('Error verifying password:', error)
        return false
    }
}

export function isPasswordHashed(password: string): boolean {
    return /^\$2[abxy]\$\d+\$/.test(password)
}
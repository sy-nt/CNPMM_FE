import { describe, expect, it } from 'vitest'

import {
  activateAccountSchema,
  loginSchema,
  passwordChangeSchema,
  profileSchema,
  signUpSchema,
  validateForm,
} from './validation'

describe('Yup auth form validation', () => {
  it('accepts valid form payloads', () => {
    expect(
      validateForm(loginSchema, {
        email: 'buyer@auxila.test',
        password: 'Password1!',
      }),
    ).toBeNull()
    expect(
      validateForm(signUpSchema, {
        email: 'buyer@auxila.test',
        firstName: 'Test',
        imageUrl: 'https://example.com/avatar.png',
        lastName: 'User',
        password: 'Password1!',
      }),
    ).toBeNull()
    expect(
      validateForm(activateAccountSchema, {
        email: 'buyer@auxila.test',
        otp: '123456',
      }),
    ).toBeNull()
    expect(
      validateForm(profileSchema, {
        imageUrl: undefined,
      }),
    ).toBeNull()
    expect(
      validateForm(passwordChangeSchema, {
        password: 'Password1!',
      }),
    ).toBeNull()
  })

  it('rejects invalid form payloads before submit', () => {
    expect(
      validateForm(loginSchema, {
        email: 'buyer',
        password: 'Password1!',
      }),
    ).toBeTruthy()
    expect(
      validateForm(signUpSchema, {
        email: 'buyer@auxila.test',
        firstName: 'Test',
        imageUrl: 'not-a-url',
        lastName: 'User',
        password: 'Password1!',
      }),
    ).toBeTruthy()
    expect(
      validateForm(activateAccountSchema, {
        email: 'buyer@auxila.test',
        otp: '12345',
      }),
    ).toBeTruthy()
    expect(
      validateForm(passwordChangeSchema, {
        password: 'password',
      }),
    ).toBeTruthy()
  })
})

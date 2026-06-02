/**
 * Cross-cutting utility types. Keep this file framework-agnostic.
 */

/**
 * Value that is explicitly "no value". The property exists but the server (or
 * caller) signalled emptiness with `null`.
 *
 * @example
 *   type AuthState = { accessToken: Nullable<string> }
 */
export type Nullable<T> = T | null

/**
 * Value that may be missing (not provided). Equivalent to the type produced by
 * an optional property (`x?: T`) but usable in positional contexts.
 *
 * @example
 *   function getCategory(id: Optional<string>) {}
 */
export type Optional<T> = T | undefined

/**
 * Value that may be missing in either sense — `null` OR `undefined`. Use at
 * API boundaries where both shapes are acceptable (e.g. an access token that
 * may be absent because the user is anonymous, or because the caller forgot
 * to pass it).
 *
 * @example
 *   function listShops(accessToken: Maybe<string>) {}
 */
export type Maybe<T> = T | null | undefined

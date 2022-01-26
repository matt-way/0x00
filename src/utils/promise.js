/**
 * Promise related helper functions
 */

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

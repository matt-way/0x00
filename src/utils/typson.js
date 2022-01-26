import Typeson from 'typeson'
import typedArrays from 'typeson-registry/dist/types/typed-arrays'

export const TSON = new Typeson().register([typedArrays])

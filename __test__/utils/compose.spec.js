const { compose1, compose2, compose3, compose4 } = require('code/utils/compose')

describe('Test compose', function () {
  const sum = (a, b) => a + b
  const square = a => a ** 2
  const plus1 = a => ++a
  it('Test compose1', function () {
    expect(compose1(plus1, square, sum)(2, 3)).toEqual(26)
  })

  it('Test compose2', function () {
    expect(compose2(plus1, square, sum)(2, 3)).toEqual(26)
  })

  it('Test compose3', async function () {
    const res = await compose3(plus1, square, sum)(2, 3)
    expect(res).toEqual(26)
  })

  it('Test compose4', async function () {
    expect(compose4(plus1, square, sum)(2, 3)).toEqual(26)
  })
})

const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments
} = require('../db/utils/utils');

describe('formatDates', () => {
  it('returns a blank array when passed one', () => {
    expect(formatDates([])).to.eql([]);
  });
  it('does not mutate the passed-in array', () => {
    const input = [];
    expect(formatDates(input)).to.not.equal(input);
  });
  it('converts the created_at timestamp for a single-item array', () => {
    const input = [{ created_at: 634694340 }];
    const actual = formatDates(input);
    const expected = [{ created_at: new Date(634694340) }];
    expect(actual).to.eql(expected);
  });
  it('handles multi-item arrays', () => {
    const input = [{ created_at: 634694340 }, { created_at: 600694340 }];
    const actual = formatDates(input);
    const expected = [
      { created_at: new Date(634694340) },
      { created_at: new Date(600694340) }
    ];
    expect(actual).to.eql(expected);
  });
});

describe('makeRefObj', () => {
  it('returns an empty object when passed an empty array', () => {
    const input = [];
    const actual = makeRefObj(input, 'title', 'article_id');
    const expected = {};
    expect(actual).to.deep.equal(expected);
  });
  it("returns an object containing one article's id", () => {
    const input = [{ article_id: 1, title: 'trump nukes denmark' }];
    const actual = makeRefObj(input, 'title', 'article_id');
    const expected = {
      'trump nukes denmark': 1
    };
    expect(actual).to.deep.equal(expected);
  });
  it('returns an object containing multiple article ids', () => {
    const input = [
      { article_id: 1, title: 'trump nukes denmark' },
      { article_id: 2, title: 'trump nukes the galapagos' },
      { article_id: 3, title: 'trump nukes tazmania' }
    ];
    const actual = makeRefObj(input, 'title', 'article_id');
    const expected = {
      'trump nukes denmark': 1,
      'trump nukes the galapagos': 2,
      'trump nukes tazmania': 3
    };
    expect(actual).to.deep.equal(expected);
  });
});

describe('formatComments', () => {
  it('returns a blank array when passed one', () => {
    expect(formatComments([])).to.eql([]);
  });
  it('does not mutate the passed-in array', () => {
    const input = [];
    expect(formatComments(input)).to.not.equal(input);
  });
  it('changes the belongs_to (string) to the correct article_id for a one-object array', () => {
    const inputArr = [
      { created_by: 'grumpy19', belongs_to: 'Making sense of Redux' }
    ];
    const refObj = { 'Making sense of Redux': 1 };
    const actual = formatComments(inputArr, refObj);
    const expected = [{ author: 'grumpy19', article_id: 1 }];
    expect(actual).to.eql(expected);
  });
  it('changes the belongs_to (string) to the correct article_id for a multi-object array', () => {
    const inputArr = [
      { created_by: 'grumpy19', belongs_to: 'Making sense of Redux' },
      { created_by: 'grumpy19', belongs_to: 'Stone Soup' }
    ];
    const refObj = { 'Making sense of Redux': 1, 'Stone Soup': 2 };
    const actual = formatComments(inputArr, refObj);
    const expected = [
      { author: 'grumpy19', article_id: 1 },
      { author: 'grumpy19', article_id: 2 }
    ];
    expect(actual).to.eql(expected);
  });
  it('changes the created_by key to be called author', () => {
    const inputArr = [
      { created_by: 'grumpy19', belongs_to: 'Making sense of Redux' },
      { created_by: 'grumpy19', belongs_to: 'Stone Soup' }
    ];
    const refObj = { 'Making sense of Redux': 1, 'Stone Soup': 2 };
    const actual = formatComments(inputArr, refObj);
    const expected = [
      { author: 'grumpy19', article_id: 1 },
      { author: 'grumpy19', article_id: 2 }
    ];
    expect(actual).to.eql(expected);
  });
});

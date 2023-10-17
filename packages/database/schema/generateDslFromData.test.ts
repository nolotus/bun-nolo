// File: generateDslFromData.test.ts
import {generateDslFromData} from './generateDslFromData';

describe('generateDslFromData function', () => {
  it('should generate correct DSL for string and enum fields', () => {
    const data = [
      {username: 'xxx', password: 'xxx', userType: 'domain'},
      {username: 'yyy', password: 'yyy', userType: 'person'},
    ];

    const expectedDsl = {
      username: {type: 'string'},
      password: {type: 'string'},
      userType: {type: 'enum', values: ['domain', 'person']},
    };

    const generatedDsl = generateDslFromData(data, ['userType']);

    expect(generatedDsl).toEqual(expectedDsl);
  });

  it('should generate correct DSL for integer, float, and boolean fields', () => {
    const data = [
      {id: 1, rating: 4.5, isActive: true},
      {id: 2, rating: 3.5, isActive: false},
    ];

    const expectedDsl = {
      id: {type: 'integer'},
      rating: {type: 'float'},
      isActive: {type: 'boolean'},
    };

    const generatedDsl = generateDslFromData(data);

    expect(generatedDsl).toEqual(expectedDsl);
  });
});

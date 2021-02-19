const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//Write a unit test that confirms our getUserByEmail function returns a user object when it's provided with an email that exists in the database.
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    
    assert.equal(user.id, expectedOutput);
  });

  //Inside the same describe statement, add another it statement to test that a non-existent email returns undefined.

  it('if the email does not exist it should return undefined', function(){
    const user = getUserByEmail('notcorrect@1', testUsers);
    const expectedOutput = undefined;

    assert.equal(user.id, expectedOutput);

  })
});
const { T3nsorResponse, Completion, StreamCompletion } = require('./t3nsor');
const completion = new Completion();
completion.create('i am alive, so are you')
  .then(response => {
    console.log(response.toJSON());
  })
  .catch(error => {
    console.error(error);
  });

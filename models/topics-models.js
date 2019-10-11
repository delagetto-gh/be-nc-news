const { connection } = require('../connection');

exports.selectTopics = topic => {
  return connection
    .select('*')
    .from('topics')
    .modify(query => {
      if (topic) query.where('slug', topic);
    })
    .then(topics => {
      if (!topics.length)
        return Promise.reject({ status: 404, msg: 'topic not found' });
      return topics;
    });
};

exports.insertTopic = topic => {
  return connection
    .insert(topic)
    .into('topics')
    .returning('*');
};

exports.formatDates = list => {
  const newArr = [...list];

  if (!list.length) return newArr;

  newArr.forEach(item => {
    let newTimestamp = new Date(item.created_at * 1000);
    item.created_at = newTimestamp;
  });
  return newArr;
};

exports.makeRefObj = (arr, key, value) => {
  const refObj = {};

  arr.forEach(item => {
    refObj[item[key]] = item[value];
  });

  return refObj;
};

exports.formatComments = (comments, articleRef) => {
  const newComments = [...comments];
  if (!comments.length) return newComments;

  newComments.forEach((comment, i) => {
    const articleID = articleRef[newComments[i].belongs_to];
    comment.article_id = articleID;
    delete comment.belongs_to;

    const createdBy = comment.created_by;
    comment.author = createdBy;
    delete comment.created_by;
  });

  return newComments;
};

exports.formatDates = list => {
  if (!list.length) return [];

  const newArr = list.map(item => {
    const newItem = { ...item };
    let newTimestamp = new Date(item.created_at);
    newItem.created_at = newTimestamp;
    return newItem;
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
  if (!comments.length) return [];

  const newComments = comments.map((comment, i) => {
    const formattedComment = { ...comment };

    const articleID = articleRef[comments[i].belongs_to];
    formattedComment.article_id = articleID;
    delete formattedComment.belongs_to;

    const createdBy = formattedComment.created_by;
    formattedComment.author = createdBy;
    delete formattedComment.created_by;
    
    return formattedComment;
  });

  return newComments;
};

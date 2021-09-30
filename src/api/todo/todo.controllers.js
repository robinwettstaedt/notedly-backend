import { Todo } from './todo.model.js';

const PRIORITY_ENUM = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];
const REPEATING_ENUM = ['MAYBE', 'NOT', 'NEEDED'];

export const getOne = (model) => async (req, res) => {
  try {
    const doc = await model
      .findOne({ _id: req.params.id })
      .select('-__v')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (!doc.createdBy.equals(req.user._id)) {
      return res.status(403).end();
    }

    res.status(200).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const getMany = (model) => async (req, res) => {
  try {
    const docs = await model
      .find({ createdBy: req.user._id })
      .lean()
      .select('-__v')
      .exec();

    if (!docs) {
      return res.status(404).end();
    }

    res.status(200).json(docs);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const createOne = (model) => async (req, res) => {
  try {
    const todo = req.body;

    if (todo.priority) {
      if (!PRIORITY_ENUM.includes(todo.priority)) {
        return res.status(400).json({
          message: `<priority> value has to be one of the following: ${PRIORITY_ENUM}`,
        });
      }
    }

    if (todo.repeating) {
      if (!REPEATING_ENUM.includes(todo.repeating)) {
        return res.status(400).json({
          message: `<repeating> value has to be one of the following: ${REPEATING_ENUM}`,
        });
      }
    }

    todo.createdBy = req.user._id;

    const createdDoc = await model.create(todo);

    const doc = await model
      .findOne({ _id: createdDoc._id })
      .select('-__v')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
  try {
    const todoUpdates = req.body;

    if (todoUpdates.priority) {
      if (!PRIORITY_ENUM.includes(todoUpdates.priority)) {
        return res.status(400).json({
          message: `<priority> value has to be one of the following: ${PRIORITY_ENUM}`,
        });
      }
    }

    if (todoUpdates.repeating) {
      if (!REPEATING_ENUM.includes(todoUpdates.repeating)) {
        return res.status(400).json({
          message: `<repeating> value has to be one of the following: ${REPEATING_ENUM}`,
        });
      }
    }

    const doc = await model
      .findOne({ _id: req.params.id })
      .select('-__v')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (!doc.createdBy.equals(req.user._id)) {
      return res.status(403).end();
    }

    // marking todo as deleted
    if (todoUpdates.deleted === true && doc.deleted === false) {
      todoUpdates.deletedAt = Date.now();
    } else if (todoUpdates.deleted === false && doc.deleted === true) {
      todoUpdates.deletedAt = undefined;
    }

    const updatedDoc = await model
      .findOneAndUpdate({ _id: req.params.id }, todoUpdates, { new: true })
      .select('-__v')
      .exec();

    if (!updatedDoc) {
      return res.status(404).end();
    }

    res.status(200).json(updatedDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeOne = (model) => async (req, res) => {
  try {
    const doc = await model.findOne({ _id: req.params.id }).lean().exec();

    if (!doc) {
      return res.status(404).end();
    }

    if (!doc.createdBy.equals(req.user._id)) {
      return res.status(403).end();
    }

    const removedDoc = await model
      .findOneAndRemove({ _id: req.params.id })
      .select('-__v')
      .exec();

    if (!removedDoc) {
      return res.status(404).end();
    }

    res.status(200).json(removedDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

// see if that somehow works #######################################################################
// remove all where createdBy === user._id && dueDate is older than today - 48? hrs
export const removeMany = (model) => async (req, res) => {
  try {
    const docs = await model
      .deleteMany({
        createdBy: req.user._id,
        dueDate: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      })
      .lean()
      .exec();

    if (!docs) {
      return res.status(404).end();
    }

    res.status(200).json(docs);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const crudControllers = (model) => ({
  getOne: getOne(model),
  getMany: getMany(model),
  createOne: createOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
  removeMany: removeMany(model),
});

export default crudControllers(Todo);

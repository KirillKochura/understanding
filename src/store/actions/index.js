import * as actionTypes from './actionTypes';
import {generate} from '../../core/calculus/examples';
import hash from 'object-hash';

export const changeMathInput = (taskId, inputId, value) => ({
  type: actionTypes.CHANGE_MATH_INPUT,
  taskId, inputId, value
});

export const changeMathExpression = (taskId, expression) => ({
  type: actionTypes.CHANGE_MATH_EXPRESSION,
  taskId, expression
});

export const setRandomMathExpression = (taskId, depth) => ({
  type: actionTypes.SET_RANDOM_MATH_EXPRESSION,
  expression: generate(depth), taskId
});

export const createChildMathTask = (parentId, parentInputId, parentKind, expression) => ({
  type: actionTypes.CREATE_CHILD_MATH_TASK,
  parentId, expression, parentInputId, parentKind,
  key: hash({expression, parentId, parentKind})
})

export const createChildMathTaskAndRedirect =
  (parentId, parentInputId, parentKind, expression, history, kind) => dispatch => {
    dispatch(createChildMathTask(parentId, parentInputId, parentKind, expression));
    history.push(`/math/tasks/${kind}/${hash({expression, parentId, parentKind})}`);
};

export const setMathExpressionToParentTask =
  (parentId, parentInputId, expression) =>({
    type: actionTypes.SET_MATH_EXPRESSION_TO_PARENT_TASK,
    parentId, parentInputId, expression,
  });
export const setMathExpressionToParentTaskAndRedirect =
  (parentId, parentInputId, expression, history, kind) => dispatch => {
    dispatch(setMathExpressionToParentTask(parentId, parentInputId, expression));
    history.push(`/math/tasks/${kind}/${parentId}`);
  };

export const selectDiffTableItem = (taskId, fun) => ({
  type: actionTypes.SELECT_DIFF_TABLE_ITEM,
  taskId, fun,
})

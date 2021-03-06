import React from "react";
import { connect } from "react-redux";
import nerdamer from "nerdamer";
import LaTeX from "~/Components/UI/LaTeX";

const mathPreview = props => {
  const ex = props.expression(props.taskId, props.inputId);
  return <LaTeX className={props.className}>{ex.er ? ex.er : ex.e}</LaTeX>;
};

const mapStateToProps = ({ calculus }) => ({
  expression: (taskId, inputId) => {
    if (!calculus.hasOwnProperty(taskId)) return { e: "", er: "No Input" };
    if (!calculus[taskId].hasOwnProperty(inputId))
      return { e: "", er: "No Input" };
    try {
      const e = nerdamer(calculus[taskId][inputId]);
      return { e: e.toTeX() };
    } catch (er) {
      return { e: "", er: er.message };
    }
  }
});

export default connect(mapStateToProps)(mathPreview);

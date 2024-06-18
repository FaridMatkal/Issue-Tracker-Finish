'use strict';

const issueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
      let projectName = req.params.project;
      try {
        const project = await ProjectModel.findOne({ name: projectName });
        if (!project) {
          res.json([{ error: "project not found" }]);
          return;
        } else {
          const issues = await issueModel.find({
            projectId: project._id,
            ...req.query,
          });
          if (!issues) {
            res.json([{ error: "no issues found" }]);
            return;
          }
          res.json(issues);
          return;
        }
      } catch(error) {
        res.json({ error: "could not get", _id: _id });
      }
    })
    
    .post(async (req, res) => {
      let projectName = req.params.project;
      
      const { issue_title, issue_text, created_by, assigned_to, status_text} =
        req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      try {
        let projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          projectModel = new ProjectModel({ name: projectName });
          projectModel = await projectModel.save();
        }
        const newIssue = new issueModel({
          projectId: projectModel.id,
          issue_title: issue_title || "",
          issue_text: issue_text || "",
          created_on: new Date(),
          updated_on: new Date(),
          created_by: created_by || "",
          assigned_to: assigned_to || "",
          open: true,
          status_text: status_text || "",
        });
        
        await newIssue.save();
        res.json(newIssue);

      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error"});
      }
    })
    
    .put(async (req, res) => {
      let projectName = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;
    
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
    
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        open === undefined
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }
    
      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          res.json({ error: "project not found" });
          return;
        }
    
        let issue = await issueModel.findByIdAndUpdate(
          _id,
          {
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            open,
            updated_on: new Date(),
          },
          { new: true }
        );
    
        if (!issue) {
          res.json({ error: "could not update", _id: _id });
          return;
        }
        res.json({ result: "successfully updated", _id: _id });
      } catch (error) {
        res.json({ error: "could not update", _id: _id });
      }
    })
    
    .delete(async (req, res) => {
      let projectName = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      try {
        const project = await ProjectModel.findOne({ name: projectName });
        if (!project) {
          res.json({ error: "project not found", _id: _id });
          return;
        }
        const issue = await issueModel.findByIdAndDelete(_id);
        if (!issue) {
          res.json({ error: "could not delete", _id: _id });
          return;
        }
        res.json({ result: "successfully deleted", _id: _id });
      } catch (error) {
        res.json({ error: "could not delete", _id: _id });
      }
    });
};

/**
 *
 * Copyright HackerBay, Inc.
 *
 */
module.exports = {
    //Description: Create new project for user.
    //Params:
    //Param 1: projectName: Project name.
    //Param 2: projectId: Project Id present in req.params.
    //Param 3: userId: User Id.
    //Returns: promise
    create: async function(projectId, message, page, createdById) {
        try {
            let feedback = new FeedbackModel();

            feedback.message = message;
            feedback.page = page;
            feedback.projectId = projectId;
            feedback.createdById = createdById;
            feedback = await feedback.save();
            feedback = feedback.toObject();

            const [project, user] = await Promise.all([
                ProjectService.findOneBy({ _id: projectId }),
                UserService.findOneBy({ _id: createdById }),
            ]);
            feedback.project = project;

            const record = await AirtableService.logFeedback({
                message,
                name: user.name,
                email: user.email,
                project: project.name,
                page,
            });
            feedback.airtableId = record.id || null;
            feedback.userName = user.name;
            feedback.email = user.email;
            feedback.phone = user.companyPhoneNumber;
            feedback.templateName = 'User Feedback';

            MailService.sendLeadEmailToFyipeTeam(feedback);
            MailService.sendUserFeedbackResponse(user.email, user.name);
            return feedback;
        } catch (error) {
            ErrorService.log('feedbackService.create', error);
            throw error;
        }
    },

    hardDeleteBy: async function(query) {
        try {
            await FeedbackModel.deleteMany(query);
            return 'Feedback(s) removed successfully!';
        } catch (error) {
            ErrorService.log('feedbackService.hardDeleteBy', error);
            throw error;
        }
    },
};

const FeedbackModel = require('../models/feedback');
const MailService = require('./mailService');
const ErrorService = require('./errorService');
const UserService = require('./userService');
const ProjectService = require('./projectService');
const AirtableService = require('./airtableService');

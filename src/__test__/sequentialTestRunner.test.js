/* eslint-disable no-undef */
import authenticationTestSuite from '../api/authentication/test/test.authentication';
import userTestSuite from '../api/user/test/test.user';
import notebookTestSuite from '../api/notebook/test/test.notebook';
import noteTestSuite from '../api/note/test/test.note';
import noteInviteTestSuite from '../api/noteInvite/test/test.noteInvite';
import {
    connectToTestMongo,
    disconnectAndDropFromTestMongo,
} from '../utils/createMongoTestConnection';
import notebookInviteTestSuite from '../api/notebookInvite/test/test.notebookInvite';

describe('run all tests sequentially', () => {
    beforeAll(async () => {
        connectToTestMongo();
    });

    afterAll(async () => {
        disconnectAndDropFromTestMongo();
    });

    authenticationTestSuite();

    userTestSuite();

    notebookTestSuite();

    noteTestSuite();

    noteInviteTestSuite();

    notebookInviteTestSuite();
});

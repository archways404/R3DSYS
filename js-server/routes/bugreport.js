require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		done();
	});

	fastify.addHook('onResponse', (request, reply, done) => {
		request.sendTime = Date.now();
		const times = calculateRequest(request);
		console.log(`Request stats: ${JSON.stringify(times)}`);
		done();
	});

	fastify.post('/submit-bug', async (request, reply) => {
		try {
			const parts = request.parts(); // ✅ Parse `multipart/form-data`

			let bugData = {
				title: '',
				description: '',
				reproduce: '',
				expected: '',
				images: [],
			};

			for await (const part of parts) {
				if (part.type === 'file') {
					// ✅ Store File Buffer
					const fileBuffer = await part.toBuffer();
					bugData.images.push({
						filename: part.filename,
						mimetype: part.mimetype,
						buffer: fileBuffer,
					});
				} else {
					// ✅ Store Form Fields (text)
					bugData[part.fieldname] = part.value;
				}
			}

			console.log('Received Bug Report:', bugData);

			// ✅ Create GitHub Issue
			const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
			const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
			const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;

			const issuePayload = {
				title: bugData.title,
				body: `### Description\n${bugData.description}\n\n### Steps to Reproduce\n${bugData.reproduce}\n\n### Expected Behavior\n${bugData.expected}\n`,
			};

			const githubResponse = await axios.post(
				`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
				issuePayload,
				{
					headers: {
						Authorization: `token ${GITHUB_TOKEN}`,
						Accept: 'application/vnd.github.v3+json',
					},
				}
			);

			const issueUrl = githubResponse.data.html_url;
			console.log(`GitHub Issue Created: ${issueUrl}`);

			reply.send({
				message: 'Bug report submitted successfully!',
				issue_url: issueUrl,
			});
		} catch (error) {
			console.error('Error processing bug report:', error);
			reply.status(500).send({ error: 'Failed to submit bug report' });
		}
	});
}

module.exports = routes;

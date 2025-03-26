// auth.js
function isAdminOrMaintainer(request, reply, done) {
	const user = request.user;
	if (!user || (user.role !== 'admin' && user.role !== 'maintainer')) {
		return reply.status(403).send({ error: 'Forbidden: Insufficient permissions' });
	}
	done();
}

module.exports = {
	isAdminOrMaintainer,
};

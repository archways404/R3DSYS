/*
const Background = () => {
	return <div className="absolute inset-0 bg-[#09090b]" />;
};

export default Background;
*/

const Background = () => {
	return (
		<div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-black via-zinc-950 to-zinc-950" />
	);
};

export default Background;

/*
<div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-br from-gray-900 via-black to-gray-900" />
*/

/*
	<div
			className="absolute inset-0 backdrop-blur-3xl"
			style={{
				background:
					'linear-gradient(135deg, hsla(0, 0%, 15%, 1) 0%, hsla(0, 0%, 9%, 1) 15%, hsla(0, 0%, 6%, 1) 30%, hsla(0, 0%, 0%, 1) 50%, hsla(0, 0%, 6%, 1) 70%, hsla(0, 0%, 9%, 1) 85%, hsla(0, 0%, 15%, 1) 100%)',
				filter: 'blur(12px)',
			}}
		/>

*/

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import FormProgression from '@/components/ui/FormProgression';

// Import Step Components
import TitleComponent from './TitleComponent';
import DescriptionComponent from './DescriptionComponent';
import ReproduceComponent from './ReproduceComponent';
import ExpectedBehaviorComponent from './ExpectedBehaviorComponent';
import ScreenshotComponent from './ScreenshotComponent';
import SummaryComponent from './SummaryComponent';

function BugreportRenderer() {
	// Define the steps and their status
	const [steps, setSteps] = useState([
		{ id: 1, title: 'Title', completed: false },
		{ id: 2, title: 'Describe the Bug', completed: false },
		{ id: 3, title: 'Reproduction Steps', completed: false },
		{ id: 4, title: 'Expected Behavior', completed: false },
		{ id: 5, title: 'Screenshots', completed: false },
		{ id: 6, title: 'Summary', completed: false },
	]);

	const [currentStep, setCurrentStep] = useState(1);
	const [images, setImages] = useState([]); // ✅ Store images
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [reproduce, setReproduce] = useState('');
	const [expected, setExpected] = useState('');

	// Function to determine if the "Next" button should be disabled
	const isNextDisabled = () => {
		switch (currentStep) {
			case 1:
				return !title.trim(); // Title must not be empty
			case 2:
				return !description.trim(); // Description must not be empty
			case 3:
				return !reproduce.trim(); // Reproduction steps must not be empty
			case 4:
				return !expected.trim(); // Expected behavior must not be empty
			case 5:
				return images.length === 0; // At least one image is required
			default:
				return false;
		}
	};

	// Function to mark the current step as completed and move to the next
	const nextStep = () => {
		if (currentStep < steps.length && !isNextDisabled()) {
			const updatedSteps = [...steps];
			updatedSteps[currentStep - 1].completed = true;
			setSteps(updatedSteps);
			setCurrentStep(currentStep + 1);
		}
	};

	// Function to move back a step
	const prevStep = () => {
		if (currentStep > 1) {
			const updatedSteps = [...steps];
			updatedSteps[currentStep - 2].completed = false;
			setSteps(updatedSteps);
			setCurrentStep(currentStep - 1);
		}
	};

	const renderStepComponent = () => {
		switch (currentStep) {
			case 1:
				return (
					<TitleComponent
						title={title}
						setTitle={setTitle}
					/>
				);
			case 2:
				return (
					<DescriptionComponent
						description={description}
						setDescription={setDescription}
					/>
				);
			case 3:
				return (
					<ReproduceComponent
						reproduce={reproduce}
						setReproduce={setReproduce}
					/>
				);
			case 4:
				return (
					<ExpectedBehaviorComponent
						expected={expected}
						setExpected={setExpected}
					/>
				);
			case 5:
				return (
					<ScreenshotComponent
						images={images}
						setImages={setImages}
					/>
				);
			case 6:
				return (
					<SummaryComponent
						title={title}
						description={description}
						reproduce={reproduce}
						expected={expected}
						images={images}
					/>
				);
			default:
				return (
					<TitleComponent
						title={title}
						setTitle={setTitle}
					/>
				);
		}
	};

	// ✅ Submit form function (including uploaded images)
	const handleSubmit = async () => {
		try {
			const formData = new FormData();

			// ✅ Append text fields to FormData
			formData.append('title', title);
			formData.append('description', description);
			formData.append('reproduce', reproduce);
			formData.append('expected', expected);

			// ✅ Append images (if any)
			images.forEach((image, index) => {
				formData.append(`screenshots`, image);
			});

			console.log('Submitting Bug Report:', {
				title,
				description,
				reproduce,
				expected,
				images,
			});

			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/submit-bug',
				{
					method: 'POST',
					body: formData, // ✅ Sending formData
				}
			);

			if (response.ok) {
				const data = await response.json();
				console.log(`Bug report submitted! Issue URL: ${data.issue_url}`);

				// ✅ Open the GitHub issue in a new tab
				window.open(data.issue_url, '_blank');

				// ✅ Redirect to home page after 2 seconds (optional delay)
				setTimeout(() => {
					window.location.href = '/';
				}, 1000);
			} else {
				const errorData = await response.json();
				console.error('Error submitting bug:', errorData);
				alert('Failed to submit bug report.');
			}
		} catch (error) {
			console.error('Error:', error);
			alert('An unexpected error occurred.');
		}
	};

	return (
		<Layout>
			{/* Outer container that centers content vertically */}
			<div className="flex items-center justify-between min-h-screen px-12">
				{/* Left Side: FormProgression (Pinned to the left) */}
				<div className="absolute left-24">
					<FormProgression steps={steps} />
				</div>

				{/* Right Side: Step Components (Centered Content) */}
				<div className="flex flex-col items-center flex-grow max-w-2xl mx-auto">
					{/* Centered Bug Report Title */}
					<h1 className="text-3xl font-bold text-center mb-8">Bug Report</h1>
					{/* Render Current Step Component */}
					<div className="w-full p-6">{renderStepComponent()}</div>

					{/* Navigation Buttons */}
					<div className="mt-6 flex justify-between w-full">
						<Button
							onClick={prevStep}
							disabled={currentStep === 1}
							variant="outline">
							Previous
						</Button>
						{currentStep === steps.length ? (
							<Button
								onClick={handleSubmit}
								variant="primary">
								Submit
							</Button>
						) : (
							<Button
								onClick={nextStep}
								disabled={isNextDisabled()}>
								Next
							</Button>
						)}
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default BugreportRenderer;

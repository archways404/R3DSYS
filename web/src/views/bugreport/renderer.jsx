import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import FormProgression from '@/components/ui/FormProgression';

// Import Step Components
import DescriptionComponent from './DescriptionComponent';
import ReproduceComponent from './ReproduceComponent';
import ExpectedBehaviorComponent from './ExpectedBehaviorComponent';
import SubmitComponent from './SubmitComponent';

function BugreportRenderer() {
	// Define the steps and their status
	const [steps, setSteps] = useState([
		{ id: 1, title: 'Describe the Bug', completed: false },
		{ id: 2, title: 'Reproduction Steps', completed: false },
		{ id: 3, title: 'Expected Behavior', completed: false },
		{ id: 4, title: 'Submit Report', completed: false },
	]);

	const [currentStep, setCurrentStep] = useState(0);

	// Function to mark the current step as completed and move to the next
	const nextStep = () => {
		if (currentStep < steps.length - 1) {
			const updatedSteps = [...steps];
			updatedSteps[currentStep].completed = true;
			setSteps(updatedSteps);
			setCurrentStep(currentStep + 1);
		}
	};

	// Function to move back a step
	const prevStep = () => {
		if (currentStep > 0) {
			const updatedSteps = [...steps];
			updatedSteps[currentStep - 1].completed = false;
			setSteps(updatedSteps);
			setCurrentStep(currentStep - 1);
		}
	};

	// Function to render the correct step component
	const renderStepComponent = () => {
		switch (currentStep) {
			case 0:
				return <DescriptionComponent />;
			case 1:
				return <ReproduceComponent />;
			case 2:
				return <ExpectedBehaviorComponent />;
			case 3:
				return <SubmitComponent />;
			default:
				return null;
		}
	};

	return (
		<Layout>
			{/* Outer container that centers content vertically */}
			<div className="flex items-center justify-between min-h-screen px-12">
				{/* Left Side: FormProgression (Pinned to the left) */}
				<div className="absolute left-24">
					<FormProgression
						steps={steps}
						currentStep={currentStep}
					/>
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
							disabled={currentStep === 0}
							variant="outline">
							Previous
						</Button>
						<Button
							onClick={nextStep}
							disabled={currentStep === steps.length}>
							{currentStep === steps.length - 1 ? 'Submit' : 'Next'}
						</Button>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default BugreportRenderer;

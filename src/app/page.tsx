'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string(),
    email: z.string().email(),
  }),
  jobDescription: z.object({
    jobTitle: z.string().min(1),
    jobDescription: z.string().optional(),
    showJobDescription: z.boolean(),
  }),
  availability: z.object({
    isAvailable: z.boolean(),
  }),
  step: z.number(),
});

// Define the type of the step names
type StepNamesType = keyof Omit<z.infer<typeof schema>, 'step'>;

// Define the steps, each step is a component
const steps: { [key in StepNamesType]: React.ReactNode } = {
  personalInfo: <PersonalInfo />,
  jobDescription: <JobDescription />,
  availability: <Availability />,
};

// Define a mapping from step number to step name
const STEPS_TO_STEP_NAMES: { [key: number]: StepNamesType } = {
  1: 'personalInfo',
  2: 'jobDescription',
  3: 'availability',
};

export default function Home() {
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
      },
      jobDescription: {
        jobTitle: '',
        jobDescription: '',
        showJobDescription: false,
      },
      availability: {
        isAvailable: false,
      },
      step: 1,
    },
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  function onSubmit(data: z.infer<typeof schema>) {
    alert(JSON.stringify(data, null, 2));
  }

  const currentStep = form.watch('step');
  const currentStepName = STEPS_TO_STEP_NAMES[currentStep];

  console.log(currentStepName, currentStep);

  return (
    // update the children of main to include the Form component
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-6 pt-6 w-full max-w-lg'
        >
          <FormControls />
          {steps[currentStepName]}
        </form>
      </Form>
    </main>
  );
}

function FormControls() {
  const { setValue, trigger, getFieldState, getValues } = useFormContext();

  // Get the current step from the form values
  const step = getValues('step');

  // Get the current step name
  const currentStepName = STEPS_TO_STEP_NAMES[step];

  const isFirstStep = Object.keys(steps)[0] === currentStepName;
  const isLastStep = step === Object.keys(steps).length;

  return (
    <div className='flex w-full gap-6 justify-between'>
      <Button
        variant='outline'
        type='button'
        disabled={isFirstStep}
        onClick={() => setValue('step', step - 1)}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
      >
        Previous
      </Button>

      {/* if it's not the last step
      else submit the form (this will also trigger validation) */}
      {isLastStep ? (
        <Button variant='default' type='submit'>
          Save
        </Button>
      ) : (
        <Button
          // Change the button type to submit when it's the last step
          type='button'
          onClick={async (e) => {
            //prevents form submission from bubbling up to the submit button
            // and triggering the form submission one step ahead
            e.stopPropagation();
            e.preventDefault();

            //Trigger validation for the current step
            // and if there are no errors, move to the next step
            await trigger(currentStepName);
            const currentStepHasErrors = getFieldState(currentStepName).error;
            if (currentStepHasErrors) return;
            setValue('step', step + 1);
          }}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Next
        </Button>
      )}
    </div>
  );
}

function PersonalInfo() {
  // Since we will use this inside the form,
  // we can get acccess to the form context using useFormContext
  const {
    control,
    formState: { errors },
  } = useFormContext<z.infer<typeof schema>>();

  return (
    <div className='grid grid-cols-2 gap-2'>
      {/* from the form control we can hook the inputs to the form via the name */}
      <FormField
        control={control}
        name='personalInfo.firstName'
        render={({ field }) => (
          <FormItem className='col-span-1'>
            <FormLabel>Firstname</FormLabel>
            <FormControl>
              <Input placeholder='Firstname' {...field} />
            </FormControl>
            {/* And access the formErrors and display them or not */}
            {errors?.personalInfo?.firstName && (
              <FormMessage title={errors.personalInfo.firstName.message} />
            )}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='personalInfo.lastName'
        render={({ field }) => (
          <FormItem className='col-span-1'>
            <FormLabel>Lastname</FormLabel>
            <FormControl>
              <Input placeholder='Lastname' {...field} />
            </FormControl>
            {errors?.personalInfo?.lastName && (
              <FormMessage title={errors.personalInfo.lastName.message} />
            )}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='personalInfo.email'
        render={({ field }) => (
          <FormItem className='col-span-2'>
            <FormLabel>Email address</FormLabel>
            <FormControl>
              <Input placeholder='Email' {...field} />
            </FormControl>
            {errors?.personalInfo?.email && (
              <FormMessage title={errors.personalInfo.email.message} />
            )}
          </FormItem>
        )}
      />
    </div>
  );
}

function JobDescription() {
  const {
    control,
    formState: { errors },
  } = useFormContext<z.infer<typeof schema>>();

  return (
    <div className='grid grid-cols-2 gap-2'>
      <FormField
        control={control}
        name='jobDescription.jobTitle'
        render={({ field }) => (
          <FormItem className='col-span-2'>
            <FormLabel>Job title</FormLabel>
            <FormControl>
              <Input placeholder='Job Title' {...field} />
            </FormControl>
            {errors?.jobDescription?.jobTitle && (
              <FormMessage title={errors.jobDescription.jobTitle.message} />
            )}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='jobDescription.jobDescription'
        render={({ field }) => (
          <FormItem className='col-span-2'>
            <FormLabel>Job description</FormLabel>
            <FormControl>
              <Input placeholder='Job Description' {...field} />
            </FormControl>
            {errors?.jobDescription?.jobDescription && (
              <FormMessage
                title={errors.jobDescription.jobDescription.message}
              />
            )}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='jobDescription.showJobDescription'
        render={({ field }) => (
          <FormItem className='col-span-1'>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className='ml-2'>Show description in profile?</FormLabel>
            {errors?.jobDescription?.showJobDescription && (
              <FormMessage
                title={errors.jobDescription.showJobDescription.message}
              />
            )}
          </FormItem>
        )}
      />
    </div>
  );
}

function Availability() {
  const {
    control,
    formState: { errors },
  } = useFormContext<z.infer<typeof schema>>();

  return (
    <div className='grid grid-cols-2 gap-2'>
      <FormField
        control={control}
        name='availability.isAvailable'
        render={({ field }) => (
          <FormItem className='col-span-1'>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className='ml-2'>Are you open to new jobs</FormLabel>
            {errors?.availability?.isAvailable && (
              <FormMessage title={errors.availability.isAvailable.message} />
            )}
          </FormItem>
        )}
      />
    </div>
  );
}

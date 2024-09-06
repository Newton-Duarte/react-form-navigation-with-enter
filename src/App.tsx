import { useState, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styles from './App.module.css';

interface FormValues {
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
}

export const App: React.FC = () => {
  const [data, setData] = useState<FormValues | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormValues>();
  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const fieldNames: (keyof FormValues)[] = ["firstName", "lastName", "gender", "age"];

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Trigger validation for all fields
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(onSubmit)(); // Submit the form if valid
    } else {
      // Find the first field with an error
      const firstErrorField = Object.keys(errors)[0] as keyof FormValues;
      const fieldIndex = fieldNames.indexOf(firstErrorField);

      // Focus on the first field with an error
      if (inputRefs.current[fieldIndex]) {
        inputRefs.current[fieldIndex]?.focus();
      }
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Form submitted:", data);
    setData(data)
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent,
    index: number,
    fieldName: keyof FormValues
  ): Promise<void> => {
    // Explicitly set the value before triggering validation
    setValue(fieldName, (e.target as HTMLInputElement).value);

    if (e.key === "Enter") {
      e.preventDefault();

      // Trigger validation for the current field
      const isValid = await trigger(fieldName);

      if (isValid) {
        const nextField = inputRefs.current[index + 1];
        if (nextField) {
          nextField.focus();
        } else if (submitButtonRef.current) {
          submitButtonRef.current.focus();
        }
      }
    }
  };

  return (
    <main className={styles.main}>
      <form className={styles.form} onSubmit={handleFormSubmit}>
        <div className={styles.formControl}>
          <input
            {...register("firstName", { required: "First name is required" })}
            ref={(el) => (inputRefs.current[0] = el)}
            onKeyDown={(e) => handleKeyDown(e, 0, "firstName")}
            placeholder="First Name"
          />
          {errors.firstName && <p>{errors.firstName.message}</p>}
        </div>

        <div className={styles.formControl}>
          <input
            {...register("lastName", { required: "Last name is required" })}
            ref={(el) => (inputRefs.current[1] = el)}
            onKeyDown={(e) => handleKeyDown(e, 1, "lastName")}
            placeholder="Last Name"
          />
          {errors.lastName && <p>{errors.lastName.message}</p>}
        </div>

        <div className={styles.formControl}>
          <select
            {...register("gender", { required: "Gender is required" })}
            ref={(el) => (inputRefs.current[2] = el)}
            onKeyDown={(e) => handleKeyDown(e, 2, "gender")}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p>{errors.gender.message}</p>}
        </div>

        <div className={styles.formControl}>
          <input
            {...register("age", { required: "Age is required", valueAsNumber: true })}
            ref={(el) => (inputRefs.current[3] = el)}
            onKeyDown={(e) => handleKeyDown(e, 3, "age")}
            placeholder="Age"
            type="number"
          />
          {errors.age && <p>{errors.age.message}</p>}
        </div>

        <button
          type="submit"
          ref={submitButtonRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(onSubmit)(); // Programmatically submit the form
            }
          }}
        >
          Submit
        </button>
      </form>
      {data && (
        <div className={styles.data}>
          {Object.keys(data).map((key) => (
            <p key={key}>{key}: <span>{data[key as keyof FormValues]}</span></p>
          ))}
        </div>
      )}
    </main>
  );
}
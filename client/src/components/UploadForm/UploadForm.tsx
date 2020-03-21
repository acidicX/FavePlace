import React from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import './UploadForm.css';
import { uploadFile } from '../../lib/uploadFile';
import { MediaType } from '../../types';

export interface IUploadFormProps {
}

interface IFormValues {
  type: MediaType;
  title: string;
  tags: Array<string>;
  file: string;
  fileAsBlob?: Blob;
}
interface IFormErrors {
  type?: string;
  title?: string;
  tags?: string;
  fileAsBlob?: string;
}

const initialValues: IFormValues = {
  type: 'image',
  title: 'test',
  tags: ['test1'],
  file: ''
}

const UploadForm: React.SFC<IUploadFormProps> = () => {

  return (
    <div className='UploadForm'>
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: IFormErrors = {};
          if (!values.type) {
            errors.type = 'Required';
          }
          if (!values.title) {
            errors.title = 'Required';
          }
          if (!values.fileAsBlob) {
            errors.fileAsBlob = 'Required';
          }
          return errors;
        }}
        onSubmit={(values: IFormValues, { setSubmitting }) => {
          const { type, title, tags, fileAsBlob } = values;
          if (!fileAsBlob) {
            throw new Error("no file");
          }
          console.log("submit");
          try {
            setSubmitting(true);
            uploadFile(type, title, tags, fileAsBlob);
            setSubmitting(false);
          } catch (e) {
            console.error(e);
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue
          /* and other goodies */
        }) => (
          <form onSubmit={handleSubmit}>
            <Field
              as="select"
              name="title"
            >
              <option value={'image'}>Image</option>
              <option value={'image360'}>360° Image</option>
              <option value={'video'}>Video</option>
            </Field>
            <ErrorMessage name="type" component="div" />
            <Field
              type="text"
              name="title"
            />
            <ErrorMessage name="title" component="div" />
            <Field type="file" name="file" onChange={
              (e: React.ChangeEvent<HTMLInputElement>): void => {
                if (e.target.files && e.target.files.length > 0) {
                  setFieldValue('fileAsBlob', e.target.files[0]);
                }
              }}
            />
            <ErrorMessage name="fileAsBlob" component="div" />
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )}
      </Formik>
    </div>
  )
}

export default UploadForm

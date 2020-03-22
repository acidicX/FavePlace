import React from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import './UploadForm.css';
import { uploadFile } from '../../lib/uploadFile';
import { MediaType, GeoLocation } from '../../types';
import { Button, FormControl, MenuItem, LinearProgress } from '@material-ui/core';
import { TextField, Select } from 'formik-material-ui';
import { CloudUpload as CloudUploadIcon } from '@material-ui/icons';
import firebase from 'firebase';
import { useHistory } from 'react-router';

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
  title: '',
  tags: ['test1'],
  file: '',
};

type UploadFormProps = {
  geo: GeoLocation;
};

const UploadForm: React.FunctionComponent<UploadFormProps> = ({ geo }) => {
  const history = useHistory();
  if (!geo.latitude || !geo.longitude) {
    return <div>Error: no lat / lng specified!</div>;
  }
  return (
    <div className="UploadForm">
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
        onSubmit={async (values: IFormValues, { setSubmitting }) => {
          const { type, title, tags, fileAsBlob } = values;
          if (!fileAsBlob) {
            throw new Error('no file');
          }

          try {
            setSubmitting(true);
            const geoPoint = new firebase.firestore.GeoPoint(
              parseFloat(geo.latitude),
              parseFloat(geo.longitude)
            );

            const snapshot = await uploadFile(type, title, tags, geoPoint, fileAsBlob);
            console.log(snapshot);
            setSubmitting(false);
            const { fullPath } = snapshot.metadata;
            history.push(`/view/${type}/${fullPath}`);
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
          setFieldValue,
          /* and other goodies */
        }) => (
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth>
              <FormControl fullWidth>
                <Field
                  className="UploadButton"
                  id="upload-button"
                  type="file"
                  name="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFieldValue('fileAsBlob', e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="upload-button">
                  <Button component="span">Foto oder Video auswählen...</Button>
                </label>
                <ErrorMessage name="fileAsBlob" component="div" />
              </FormControl>

              <Field component={Select} name="type">
                <MenuItem value={'image'}>Foto</MenuItem>
                <MenuItem value={'image360'}>360° Foto</MenuItem>
                <MenuItem value={'video'}>Video</MenuItem>
              </Field>
              <ErrorMessage name="type" component="div" />
            </FormControl>

            <FormControl fullWidth>
              <Field
                component={TextField}
                placeholder="Unser Lieblingsort..."
                type="text"
                name="title"
              />
              <ErrorMessage name="title" component="div" />
            </FormControl>

            <div className="UploadActions">
              {isSubmitting && <LinearProgress />}

              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                type="submit"
                disabled={isSubmitting}
              >
                Hochladen
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default UploadForm;

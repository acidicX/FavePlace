import React from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import './UploadForm.css';
import { uploadFile } from '../../lib/uploadFile';
import { MediaType, GeoLocation } from '../../types';
import {
  Button,
  FormControl,
  LinearProgress,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Videocam as VideocamIcon,
  VideoLibrary as VideoLibraryIcon,
} from '@material-ui/icons';
import firebase from 'firebase';
import { useHistory } from 'react-router';

interface IFormValues {
  type: MediaType | '';
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
  type: '',
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
          if (!fileAsBlob || !type) {
            throw new Error('no file or type');
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
              <div className="FormSpacer" />
              <FormControl component="fieldset">
                <FormLabel component="legend">Medien-Typ</FormLabel>
                <Field
                  required
                  component={RadioGroup}
                  defaultValue={initialValues.type}
                  value={values.type}
                  name="type"
                  aria-label="type"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    if (e.target.value) {
                      setFieldValue('type', e.target.value);
                    }
                  }}
                >
                  <FormControlLabel value="image" control={<Radio />} label="Foto" />
                  <FormControlLabel value="image360" control={<Radio />} label="360° Foto" />
                  <FormControlLabel value="video" control={<Radio />} label="Video" />
                </Field>
              </FormControl>
              <ErrorMessage name="type" component="div" />
            </FormControl>
            <div className="FormSpacer" />

            <FormControl fullWidth>
              <div className="FormSpacer" />
              <FormLabel component="legend">Foto oder Video aufnehmen / Datei hochladen</FormLabel>
              <Field
                className="UploadButton"
                id="upload-button"
                type="file"
                accept={
                  values.type === 'video'
                    ? 'video/mp4,video/x-m4v,video/*'
                    : 'image/png,image/jpg,image/jpeg'
                }
                name="file"
                autoFocus
                capture={values.type === 'image' || values.type === 'video'}
                multiple={false}
                disabled={!values.type}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFieldValue('fileAsBlob', e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="upload-button" className={values.type ? 'FilePickerActions' : ''}>
                <Button component={'span'} disabled={!values.type}>
                  {!values.type ? 'Bitte zuerst einen Typ auswählen' : null}
                  {values.type && values.type === 'video' ? (
                    <span>
                      <VideocamIcon /> <VideoLibraryIcon /> Video aufnehmen oder auswählen...
                    </span>
                  ) : null}
                  {values.type && values.type === 'image' ? (
                    <span>
                      <PhotoCameraIcon /> <PhotoLibraryIcon /> Foto aufnehmen oder auswählen...
                    </span>
                  ) : null}
                  {values.type && values.type === 'image360' ? (
                    <span>
                      <PhotoLibraryIcon /> Foto auswählen...
                    </span>
                  ) : null}
                </Button>
              </label>
              <ErrorMessage name="fileAsBlob" component="div" />
            </FormControl>
            <div className="FormSpacer" />

            <FormControl fullWidth>
              <div className="FormSpacer" />
              <FormLabel component="legend">Beschreibung</FormLabel>
              <Field
                component={TextField}
                placeholder="Dies ist mein Lieblingsort... (benötigt)"
                type="text"
                name="title"
                required
                error={errors.title}
              />
              <ErrorMessage name="title" component="div" />
            </FormControl>
            <div className="FormSpacer" />

            <div className="UploadActions">
              {isSubmitting && <LinearProgress />}
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                type="submit"
                disabled={isSubmitting || !values.fileAsBlob || !values.title}
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

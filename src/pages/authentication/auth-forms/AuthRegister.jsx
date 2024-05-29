import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// ============== date ============
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
// import AdapterMoment from '@date-io/moment';
// import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// third party
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';

import { Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

import TermsDialog from './TermsDialog';

//============= register imports ==================
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../../services/auth/auth-api.js';

import { postThirdPartyRegisterAuth } from '../../../services/auth/auth-api.js';

import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

import moment from 'moment';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================|| JWT - REGISTER ||============================ //

export default function AuthRegister() {
  const queryClient = useQueryClient();
  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState('');
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  const handleTermsDialogToggle = (e) => {
    e.preventDefault();
    setTermsDialogOpen(!termsDialogOpen);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  //================== register ===================
  const creactMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      setIsLoading(false);
      // queryClient.invalidateQueries(["spare-parts"]);
      toast.success('Account Created Successfully');
    },
    onError: (error) => {
      setIsLoading(false);
      // props.onClose();
      error?.response?.data?.message
        ? toast.error(error?.response?.data?.message)
        : !error?.response
          ? toast.warning('Check Your Internet Connection Please')
          : toast.error('An Error Occured Please Contact Admin');
    }
  });

  //T============== hird party auth ==================

  const thirdPartyRegisterAuthMutation = useMutation({
    mutationFn: (variables) => postThirdPartyRegisterAuth(variables),
    onSuccess: (data) => {
      console.log('postThirdPartyAuth data : ', data);
      setIsLoading(false);
      queryClient.invalidateQueries([]);
      //   axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      navigate('/');
      // window.location.reload();
    },
    onError: (error) => {
      error?.response?.data?.message
        ? toast.error(error?.response?.data?.message)
        : !error?.response
          ? toast.warning('Check Your Internet Connection Please')
          : toast.error('An Error Occured Please Contact Admin');
      setIsLoading(false);

      console.log('login error : ', error);
    }
  });

  return (
    <>
      <Formik
        initialValues={{
          firstname: '',
          lastname: '',
          email: '',
          company: '',
          password: '',
          phone: '',
          dateOfBirth: null,
          role: '',
          healthFacility: '',
          agree: false,
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required('First Name is required'),
          lastname: Yup.string().max(255).required('Last Name is required'),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().max(255).required('Password is required'),
          phone: Yup.string()
            .matches(/^\+[1-9]\d{1,14}$/, 'Phone number is not valid')
            .required('Phone number is required'),
          dateOfBirth: Yup.date().required('Date of Birth is required'),
          // dateOfBirth: Yup.date()
          //   .max(moment().subtract(18, 'years'), 'You must be at least 18 years old')
          //   .required('Year of Birth is required'),
          role: Yup.string().required('Role is required'),
          healthFacility: Yup.string().when('role', {
            is: 'Health Facility Manager',
            then: Yup.string().required('Health Facility is required')
          }),
          agree: Yup.boolean().oneOf([true], 'You must accept the terms and conditions')
        })}
        onSubmit={(values, { setSubmitting }) => {
          console.log('🚀 ~ AuthRegister ~ values:', values);
          // handle form submission
          console.log(values);
          setSubmitting(false);
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="firstname-signup">First Name*</InputLabel>
                  <OutlinedInput
                    id="firstname-login"
                    type="firstname"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                  />
                </Stack>
                {touched.firstname && errors.firstname && (
                  <FormHelperText error id="helper-text-firstname-signup">
                    {errors.firstname}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="lastname-signup">Last Name*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    type="lastname"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                    inputProps={{}}
                  />
                </Stack>
                {touched.lastname && errors.lastname && (
                  <FormHelperText error id="helper-text-lastname-signup">
                    {errors.lastname}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{}}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-signup">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Field name="role">
                  {({ field, form, meta }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor="role-signup">Role*</InputLabel>
                      <Select
                        id="role-signup"
                        value={field.value}
                        // onChange={(e) => {
                        //   setSelectedRole(e.target.value);
                        //   form.setFieldValue(field.name, e.target.value);
                        // }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedRole(value);
                          form.setFieldValue(field.name, value);
                          if (value !== 'Health Facility Manager') {
                            form.setFieldValue('healthFacility', '');
                          }
                        }}
                        displayEmpty
                        fullWidth
                        error={Boolean(meta.touched && meta.error)}
                      >
                        <MenuItem value="" disabled>
                          Select a Role
                        </MenuItem>
                        <MenuItem value="Patient">Patient</MenuItem>
                        <MenuItem value="Health Facility Manager">Health Facility Manager</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                      </Select>
                      {meta.touched && meta.error && <FormHelperText error>{meta.error}</FormHelperText>}
                    </Stack>
                  )}
                </Field>
              </Grid>

              {selectedRole === 'Health Facility Manager' && (
                <Grid item xs={12} md={6}>
                  <Field name="healthFacility">
                    {({ field, form, meta }) => (
                      <Stack spacing={1}>
                        <InputLabel htmlFor="healthFacility-signup">Health Facility*</InputLabel>
                        <Select
                          id="healthFacility-signup"
                          value={field.value}
                          onChange={(e) => {
                            form.setFieldValue(field.name, e.target.value);
                          }}
                          displayEmpty
                          fullWidth
                          error={Boolean(meta.touched && meta.error)}
                        >
                          <MenuItem value="" disabled>
                            Select a Health Facility
                          </MenuItem>
                          <MenuItem value="Case Clinic">Case Clinic</MenuItem>
                          <MenuItem value="Mulago">Mulago</MenuItem>
                          <MenuItem value="Mengo">Mengo</MenuItem>
                          {/* Add more facilities as needed */}
                        </Select>
                        {meta.touched && meta.error && <FormHelperText error>{meta.error}</FormHelperText>}
                      </Stack>
                    )}
                  </Field>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="phone-signup">Phone Number*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.phone && errors.phone)}
                    id="phone-signup"
                    type="text"
                    value={values.phone}
                    name="phone"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="1234567890"
                  />
                </Stack>
                {touched.phone && errors.phone && (
                  <FormHelperText error id="helper-text-phone-signup">
                    {errors.phone}
                  </FormHelperText>
                )}
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="dateOfBirth-signup">Date of Birth*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.dateOfBirth && errors.dateOfBirth)}
                    id="dateOfBirth-signup"
                    type="date"
                    value={values.dateOfBirth}
                    name="dateOfBirth"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    inputProps={{
                      max: moment().subtract(18, 'years').format('YYYY-MM-DD')
                    }}
                  />
                </Stack>
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <FormHelperText error id="helper-text-dateOfBirth-signup">
                    {errors.dateOfBirth}
                  </FormHelperText>
                )}
              </Grid> */}

              <Grid item xs={12} md={6}>
                <Field name="dateOfBirth">
                  {({ field, meta }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor="dateOfBirth">Date of Birth*</InputLabel>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                          views={['year', 'month', 'day']}
                          value={field.value}
                          onChange={(value) => field.onChange({ target: { value, name: field.name } })}
                          renderInput={(params) => <OutlinedInput {...params} fullWidth error={Boolean(meta.touched && meta.error)} />}
                        />
                      </LocalizationProvider>
                      {meta.touched && meta.error && <FormHelperText error>{meta.error}</FormHelperText>}
                    </Stack>
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="agree" type="checkbox">
                  {({ field, meta }) => (
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} color="primary" />}
                        label={
                          <Typography variant="body2">
                            I agree to the{' '}
                            <Link component="button" onClick={handleTermsDialogToggle} style={{ cursor: 'pointer', color: 'tomato' }}>
                              Terms and Conditions
                            </Link>
                          </Typography>
                        }
                      />
                      {meta.touched && meta.error && <FormHelperText error>{meta.error}</FormHelperText>}
                    </Stack>
                  )}
                </Field>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    inputProps={{}}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.password}
                  </FormHelperText>
                )}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  By Signing up, you agree to our &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Terms of Service
                  </Link>
                  &nbsp; and &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Privacy Policy
                  </Link>
                </Typography>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Create Account
                  </Button>
                </AnimateButton>
              </Grid>
              <Grid item xs={12}>
                <Divider>
                  <Typography variant="caption"> SignUp with</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12}>
                <center>
                  <GoogleLogin
                    // theme={theme === "dark" ? "filled_blue" : "outline"}
                    onSuccess={async (response) => {
                      console.log(response);
                      let responseDecoded = jwtDecode(response?.credential);
                      // console.log('🚀 ~ Login ~ responseDecoded:', responseDecoded);
                      let dataToPost = {
                        name: responseDecoded?.name,
                        picture: responseDecoded?.picture,
                        client_id: response?.clientId,
                        provider: 'google',
                        email: responseDecoded?.email
                      };
                      thirdPartyRegisterAuthMutation.mutate(dataToPost);
                    }}
                    onError={() => {
                      console.log('Login Failed');
                    }}
                  />
                </center>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
      <TermsDialog open={termsDialogOpen} handleClose={handleTermsDialogToggle} />
    </>
  );
}

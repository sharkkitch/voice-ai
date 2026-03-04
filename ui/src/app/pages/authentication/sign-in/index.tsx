import { useState, useContext, useEffect, useCallback } from 'react';
import { Helmet } from '@/app/components/helmet';
import { SocialButtonGroup } from '@/app/components/form/button-group/SocialButtonGroup';
import { Input } from '@/app/components/form/input';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  AuthenticateResponse,
  Google,
  Linkedin,
  Github,
  AuthenticateUser,
} from '@rapidaai/react';
import { useRapidaStore } from '@/hooks';
import { ErrorMessage } from '@/app/components/form/error-message';
import { IBlueBGArrowButton } from '@/app/components/form/button';
import { ServiceError } from '@rapidaai/react';
import { AuthContext } from '@/context/auth-context';
import { FormLabel } from '@/app/components/form-label';
import { FieldSet } from '@/app/components/form/fieldset';
import { useWorkspace } from '@/workspace';
import { connectionConfig } from '@/configs';
/**
 *
 * @returns
 */
export function SignInPage() {
  /**
   * To naviagate to dashboard
   */
  let navigate = useNavigate();
  /**
   * authentication context with a setter
   */
  const { setAuthentication } = useContext(AuthContext);
  /**
   * set loading
   */
  const { loading, showLoader, hideLoader } = useRapidaStore();
  /**
   * form utils
   */
  const { register, handleSubmit } = useForm();

  /**
   * error for the page
   */
  const [error, setError] = useState('');

  /**
   * workspace
   */
  const workspace = useWorkspace();
  const [searchParams] = useSearchParams();
  const { next, externalValidation, code, state } = Object.fromEntries(
    searchParams.entries(),
  );
  /**
   *
   * for setting authentication
   * @param data
   */
  const afterAuthenticate = useCallback(
    (err: ServiceError | null, auth: AuthenticateResponse | null) => {
      hideLoader();
      if (auth?.getSuccess()) {
        if (setAuthentication)
          setAuthentication(auth.getData(), () => {
            if (next && externalValidation) {
              window.location.replace(next);
              return;
            }
            return navigate('/dashboard');
          });
      } else {
        let errorMessage = auth?.getError();
        if (errorMessage) setError(errorMessage.getHumanmessage());
        else {
          console.error(err);
          setError('Unable to process your request. please try again later.');
        }
        return;
      }
    },
    [],
  );

  /**
   * calling for authentication
   * @param data
   */
  const onAuthenticate = data => {
    showLoader();
    AuthenticateUser(
      connectionConfig,
      data.email,
      data.password,
      afterAuthenticate,
    );
  };

  /**
   * when we recieve the authentication from social connect
   */
  useEffect(() => {
    if (state && code) {
      showLoader();

      if (state === 'google')
        Google(connectionConfig, afterAuthenticate, state, code);
      if (state === 'linkedin')
        Linkedin(connectionConfig, afterAuthenticate, state, code);
      if (state === 'github')
        Github(connectionConfig, afterAuthenticate, state, code);
    }
  }, [afterAuthenticate, code, state]);

  return (
    <>
      <Helmet title="Signin to your account"></Helmet>
      <div className="flex justify-between items-baseline">
        <h2 className="text-[28px] leading-9 text-gray-900 dark:text-gray-100">
          Sign in
        </h2>
        {workspace.authentication.signUp.enable && (
          <a
            className="text-sm text-primary underline hover:text-primary/80"
            href="/auth/signup"
          >
            I don't have an account
          </a>
        )}
      </div>

      <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit(onAuthenticate)}>
        <FieldSet>
          <FormLabel>Email Address</FormLabel>
          <Input
            {...register('email')}
            autoComplete="email"
            type="email"
            required={true}
            className="bg-light-background"
            placeholder="eg: john@rapida.ai"
          ></Input>
        </FieldSet>
        <FieldSet>
          <FormLabel>Password</FormLabel>
          <Input
            {...register('password')}
            autoComplete="password"
            type="password"
            required={true}
            className="bg-light-background"
            placeholder="******"
          ></Input>
        </FieldSet>
        <ErrorMessage message={error} />
        <IBlueBGArrowButton
          className="w-full justify-between h-11"
          type="submit"
          isLoading={loading}
        >
          Continue
        </IBlueBGArrowButton>
      </form>
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-center">
          <a
            className="text-sm text-primary underline hover:text-primary/80"
            href="/auth/forgot-password"
          >
            Can't sign in?
          </a>
        </p>
        <SocialButtonGroup
          {...workspace.authentication.signIn.providers}
        ></SocialButtonGroup>
      </div>
    </>
  );
}

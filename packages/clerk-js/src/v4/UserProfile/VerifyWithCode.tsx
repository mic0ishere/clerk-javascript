import { EmailAddressResource, PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useNavigate } from '../../ui/hooks/useNavigate';
import { Button } from '../customizables';
import { useCardState, useCodeControl } from '../elements';
import { CodeForm } from '../elements/CodeForm';
import { useLoadingStatus } from '../hooks';
import { handleError, sleep, useFormControl } from '../utils';
import { ContentPage } from './Page';

type VerifyWithCodeProps = {
  nextStep: () => void;
  identification?: EmailAddressResource | PhoneNumberResource;
  identifier?: string;
  prepareVerification?: () => Promise<any> | undefined;
};

export const VerifyWithCode = (props: VerifyWithCodeProps) => {
  const card = useCardState();
  const { nextStep, identification, identifier, prepareVerification } = props;
  const { navigate } = useNavigate();
  const [success, setSuccess] = React.useState(false);
  const status = useLoadingStatus();
  const codeControlState = useFormControl('code', '');
  const codeControl = useCodeControl(codeControlState);

  React.useEffect(() => {
    void prepare();
  }, []);

  const prepare = () => {
    return prepareVerification?.()?.catch(err => handleError(err, [], card.setError));
  };

  const resolve = async () => {
    setSuccess(true);
    await sleep(750);
    nextStep();
  };

  const reject = async (err: any) => {
    handleError(err, [codeControlState], card.setError);
    status.setIdle();
    await sleep(750);
    codeControl.reset();
  };

  codeControl.onCodeEntryFinished(code => {
    status.setLoading();
    codeControlState.setError(undefined);
    return identification
      ?.attemptVerification({ code: code })
      .then(() => resolve())
      .catch(reject);
  });

  return (
    <>
      <CodeForm
        title={'Verification code'}
        subtitle={`Enter verification code sent to ${identifier}`}
        codeControl={codeControl}
        isLoading={status.isLoading}
        success={success}
        onResendCodeClicked={prepare}
      />
      <ContentPage.Toolbar>
        <Button
          textVariant='buttonSmall'
          variant={'ghost'}
          onClick={() => navigate('../')}
        >
          Cancel
        </Button>
      </ContentPage.Toolbar>
    </>
  );
};

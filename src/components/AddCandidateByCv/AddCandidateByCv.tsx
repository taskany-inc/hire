import { ComponentProps, useCallback, useState } from 'react';
import { Candidate } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { CvAttach } from '../CvAttach/CvAttach';
import { CvParsingResult } from '../../modules/aiAssistantTypes';
import { AddOrUpdateCandidate } from '../AddOrUpdateCandidate/AddOrUpdateCandidate';
import { CandidateInterviewCreationForm } from '../CandidateInterviewCreationForm/CandidateInterviewCreationForm';

import s from './AddCandidateByCv.module.css';
import { tr } from './AddCandidateByCv.i18n';

export const AddCandidateByCv = () => {
    const [cvAttach, setCvAttach] = useState<{ id: string; filename: string }>();
    const [cvParsingResult, setCvParsingResult] = useState<CvParsingResult>();
    const [candidate, setCandidate] = useState<Candidate>();

    const onCvParse = useCallback<ComponentProps<typeof CvAttach>['onParse']>((attach, parsedData) => {
        setCvAttach(attach);
        setCvParsingResult(parsedData);
    }, []);

    return (
        <div className={s.AddCandidateByCv}>
            {nullable(!(candidate || cvParsingResult), () => (
                <CvAttach onParse={onCvParse} />
            ))}

            {nullable(!candidate && cvParsingResult, (p) => (
                <>
                    <Text size="xl" weight="bold" className={s.Heading}>
                        {tr('New candidate')}
                    </Text>
                    <AddOrUpdateCandidate
                        variant="new"
                        candidate={{ name: p.name, email: p.email, phone: p.phone }}
                        onSave={setCandidate}
                    />
                </>
            ))}

            {nullable(candidate, (c) => (
                <>
                    <Text size="xl" weight="bold" className={s.Heading}>
                        {tr('New interview')}
                    </Text>
                    <CandidateInterviewCreationForm candidate={c} preparedCvAttach={cvAttach} />
                </>
            ))}
        </div>
    );
};

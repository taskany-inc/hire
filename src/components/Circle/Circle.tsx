import { forwardRef } from 'react';

import s from './Circle.module.css';

interface CircleProps extends React.RefAttributes<HTMLSpanElement> {}

export const Circle = forwardRef<HTMLSpanElement, React.PropsWithChildren<CircleProps>>((props, ref) => (
    <span className={s.Circle} {...props} ref={ref} />
));

export interface PulseIndicatorProps {
  color: string;
  text: string;
}

const PulseIndicator: React.FC<PulseIndicatorProps> = ({ color, text }) => {
  return (
    <div className={`mazeStatus mazeStatus-${color}`}>
      <span className="mazeStatusDot" aria-hidden="true" />
      <p className="mazeStatusText">{text}</p>
    </div>
  );
};

export default PulseIndicator;

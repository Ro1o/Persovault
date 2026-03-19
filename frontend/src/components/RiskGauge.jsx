function RiskGauge({ probability }) {

  const percentage = Math.round(probability * 100);

  return (

    <div className="risk-gauge">

      <h2>Suspension Risk (6 Months)</h2>

      <div className="risk-value">
        {percentage}%
      </div>

    </div>

  );

}

export default RiskGauge;
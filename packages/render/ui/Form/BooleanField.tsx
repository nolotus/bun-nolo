export const BooleanField = ({ id, register }) => {
  return <input id={id} {...(register && register(id))} type="checkbox" />;
};

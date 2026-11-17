import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const addressFields = (optional = false) => {
  const rule = (field) =>
    optional ? body(field).optional({ values: "falsy" }) : body(field);

  return [
    rule("fullname").trim().notEmpty().withMessage("Full name is required"),
    rule("phone")
      .trim()
      .isMobilePhone("any")
      .withMessage("Please provide a valid phone number"),
    rule("line1")
      .trim()
      .notEmpty()
      .withMessage("Address line 1 is required")
      .isLength({ max: 200 })
      .withMessage("Address line 1 is too long"),
    body("line2").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
    rule("city").trim().notEmpty().withMessage("City is required"),
    rule("state").trim().notEmpty().withMessage("State is required"),
    rule("pincode")
      .trim()
      .isPostalCode("any")
      .withMessage("Please provide a valid pincode"),
    body("country").optional({ values: "falsy" }).trim().notEmpty(),
    body("label")
      .optional({ values: "falsy" })
      .isIn(["home", "work", "other"])
      .withMessage("Label must be home, work or other"),
    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be a boolean"),
  ];
};

export const createAddressValidation = [...addressFields(), validateRequest];

// Update is a partial patch — every field is optional, but any field that IS
// sent still has to be valid.
export const updateAddressValidation = [
  ...addressFields(true),
  validateRequest,
];

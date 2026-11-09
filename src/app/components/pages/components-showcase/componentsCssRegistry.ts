import { generateButtonsSectionCSS } from "./ButtonsSection";
import { generateFieldStateCSS } from "./FormControlsSection";

// Every function below reproduces, verbatim, the raw CSS already shown behind
// the individual "Copy CSS" buttons throughout the Components tab (Buttons,
// Data Table, Form Controls, Dialogs, KPI Cards, VMS-ported patterns, and the
// rest of the "new component" showcases). generateComponentsCSS() concatenates
// all of them, so the "All CSS Files" download on the Design Tokens page always
// contains every component pattern in the app, not just a hand-picked subset.

function dataTableSectionCSS(): string {
  return `
/* [DTB-00] Table Container */
.table-container {
  width: 100%;
  border: 1px solid #dddbda;
  border-radius: 6px;
  overflow: hidden;
  background-color: #ffffff;
}

/* [DTB-01] Table Title & Toolbar */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #dddbda;
  background-color: #ffffff;
}
.table-toolbar__title {
  font-size: 14px;
  font-weight: 500;
  color: #080707;
}
.table-toolbar__count {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  background-color: #e6f4ea;
  color: #145F33;
  font-size: 11px;
  font-weight: 500;
}
.table-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.table-toolbar__action-btn {
  padding: 6px;
  border-radius: 4px;
  color: #706e6b;
  background: none;
  border: none;
  cursor: pointer;
}
.table-toolbar__action-btn:hover { background-color: #f3f2f2; }

/* [DTB-02] Header Cell — Unsorted */
.table-header-cell {
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: #706e6b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #dddbda;
  background-color: #f3f2f2;
  white-space: nowrap;
}
.table-header-cell__sort-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* [DTB-03] Header Cell — Sorted (Ascending) */
.table-header-cell--sorted {
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: #145F33;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #dddbda;
  background-color: #f3f2f2;
  white-space: nowrap;
}
.table-header-cell__sort-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* [DTB-02B] Header Cell — No Sort */
.table-header-cell--no-sort {
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: #706e6b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #dddbda;
  background-color: #f3f2f2;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}

/* [DTB-04] Data Cell Types — ID / Link Cell */
.table-cell--id {
  padding: 10px 16px;
  font-size: 13px;
  vertical-align: middle;
  border-bottom: 1px solid #eeeeec;
  color: #005EA2;
  font-weight: 500;
  cursor: pointer;
}
.table-cell--id:hover { text-decoration: underline; }

/* [DTB-04] Data Cell Types — Emphasized Text Cell */
.table-cell--name {
  padding: 10px 16px;
  font-size: 13px;
  vertical-align: middle;
  border-bottom: 1px solid #eeeeec;
  color: #080707;
}

/* [DTB-04] Data Cell Types — Normal Text Cell */
.table-cell--meta {
  padding: 10px 16px;
  font-size: 13px;
  vertical-align: middle;
  border-bottom: 1px solid #eeeeec;
  color: #706e6b;
}

/* [DTB-04] Data Cell Types — Badge — Success */
.status-badge--success {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background-color: #e6f4ea;
  color: #145F33;
  border: 1px solid #a8d5b8;
}

/* [DTB-04] Data Cell Types — Badge — Info */
.status-badge--info {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background-color: #e0f2fe;
  color: #005EA2;
  border: 1px solid #7dd3fc;
}

/* [DTB-04] Data Cell Types — Badge — Warning */
.status-badge--warning {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

/* [DTB-04] Data Cell Types — Badge — Error */
.status-badge--error {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background-color: #fce4ec;
  color: #A82031;
  border: 1px solid #f48fb1;
}

/* [DTB-04] Data Cell Types — Badge — Default */
.status-badge--default {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background-color: #f3f2f2;
  color: #706e6b;
  border: 1px solid #c9c7c5;
}

/* [DTB-04] Data Cell Types — Row Action Cell */
.table-cell--action {
  padding: 10px 16px;
  font-size: 13px;
  vertical-align: middle;
  border-bottom: 1px solid #eeeeec;
  text-align: right;
}
.table-cell--action button {
  padding: 4px;
  border-radius: 4px;
  border: none;
  background: none;
  color: #706e6b;
  cursor: pointer;
}
.table-cell--action button:hover { background-color: #ecebea; }

/* [DTB-04] Data Cell Types — Row Hover */
.table-row:hover { background-color: #f0f0ee; }

/* [DTB-04] Data Cell Types — Alt Row */
.table-row--alt { background-color: #f3f2f2; }

/* [DTB-05] Table Footer / Pagination Bar */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #dddbda;
  background-color: #f3f2f2;
}
.table-footer__count { font-size: 12px; color: #706e6b; }
.table-footer__count strong { color: #080707; font-weight: 600; }
.table-footer__pager { display: flex; align-items: center; gap: 12px; }
.table-footer__page-label { font-size: 12px; color: #080707; }
.table-footer__page-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border-radius: 9999px;
  border: 1px solid #dddbda;
  background: none;
  color: #706e6b;
  cursor: pointer;
}
.table-footer__page-btn:hover { background-color: #f3f2f2; }
`;
}

function formControlsSectionCSS(): string {
  return `
/* [FRM-01] Text Inputs */
.form-label { display: block; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.025em; color: #706e6b; margin-bottom: 6px; }
.form-input { width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }
.form-input:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }
.form-input--readonly { background-color: #fafaf9; cursor: not-allowed; }
.form-input--disabled { background-color: #f3f2f2; cursor: not-allowed; }
.form-input--error { border-color: #A82031; }
.form-error-msg { font-size: 11px; color: #A82031; margin-top: 4px; }

/* [FRM-01] Text Inputs — Label — no size variant */

                  .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    color: #706e6b;
                    margin-bottom: 6px;
                  }
                  
.form-label--required .required-asterisk {
                    color: #c23934;
                  }
                

/* [FRM-01] Text Inputs — First Name, Medium — 36px */

                        .form-input {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #ffffff;
                        }
                      

/* [FRM-01] Text Inputs — First Name, Small — 28px */

                        .form-input--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #ffffff;
                        }
                      

/* [FRM-01] Text Inputs — Email (placeholder), Medium — 36px */

                        .form-input--placeholder {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          color: #9e9e9c;
                        }
                      

/* [FRM-01] Text Inputs — Email (placeholder), Small — 28px */

                        .form-input--placeholder--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          color: #9e9e9c;
                        }
                      

/* [FRM-01] Text Inputs — Phone (error), Medium — 36px */

                        .form-input--error {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #a82031;
                          border-radius: 4px;
                          font-size: 13px;
                        }
                        
.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      

/* [FRM-01] Text Inputs — Phone (error), Small — 28px */

                        .form-input--error--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #a82031;
                          border-radius: 4px;
                          font-size: 12px;
                        }
                        
.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      

/* [FRM-01] Text Inputs — Organization (read-only), Medium — 36px */

                        .form-input--readonly {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      

/* [FRM-01] Text Inputs — Organization (read-only), Small — 28px */

                        .form-input--readonly--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      

/* [FRM-01] Text Inputs — Assigned Worker (disabled), Medium — 36px */

                        .form-input--disabled {
                          height: 36px;
                          padding: 0 12px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      

/* [FRM-01] Text Inputs — Assigned Worker (disabled), Small — 28px */

                        .form-input--disabled--sm {
                          height: 28px;
                          padding: 0 10px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      

/* [FRM-01] Text Inputs — Search (focus), Medium — 36px */

                        .form-input:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      

/* [FRM-01] Text Inputs — Search (focus), Small — 28px */

                        .form-input--sm:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle */
.form-select { appearance: none; width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }
.form-select:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }
.form-select--disabled { background-color: #f3f2f2; cursor: not-allowed; opacity: 0.6; }
.checkbox { width: 16px; height: 16px; border-radius: 4px; }
.checkbox--checked { background-color: #145F33; }
.checkbox--unchecked { border: 1px solid #c9c7c5; }
.checkbox--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.toggle { width: 36px; height: 20px; border-radius: 9999px; position: relative; }
.toggle--on { background-color: #145F33; }
.toggle--off { background-color: #9e9e9c; }
.toggle-thumb { position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 9999px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* [FRM-02] Select, Checkbox & Toggle — Select Default, Medium — 36px */

                            .form-select {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              gap: 8px;
                              height: 36px;
                              padding: 8px 12px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 4px;
                              font-size: 13px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: pointer;
                            }
                            .form-select__chevron {
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              color: #54595f;
                              opacity: 0.5;
                            }
                          

/* [FRM-02] Select, Checkbox & Toggle — Select Default, Small — 28px */

                            .form-select--sm {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              gap: 6px;
                              height: 28px;
                              padding: 4px 10px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 0.25rem;
                              font-size: 12px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: pointer;
                            }
                            .form-select__chevron {
                              width: 16px;
                              height: 16px;
                              flex-shrink: 0;
                              color: #54595f;
                              opacity: 0.5;
                            }
                          

/* [FRM-02] Select, Checkbox & Toggle — Select Focus, Medium — 36px */

                            .form-select:focus {
                              border-color: #145f33;
                              box-shadow: 0 0 0 3px
                                rgba(20, 95, 51, 0.5);
                              outline: none;
                            }
                          

/* [FRM-02] Select, Checkbox & Toggle — Select Focus, Small — 28px */

                            .form-select--sm:focus {
                              border-color: #145f33;
                              box-shadow: 0 0 0 3px
                                rgba(20, 95, 51, 0.5);
                              outline: none;
                            }
                          

/* [FRM-02] Select, Checkbox & Toggle — Select Disabled, Medium — 36px */

                            .form-select--disabled {
                              height: 36px;
                              padding: 8px 12px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 4px;
                              font-size: 13px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: not-allowed;
                              opacity: 0.5;
                            }
                          

/* [FRM-02] Select, Checkbox & Toggle — Select Disabled, Small — 28px */

                            .form-select--disabled--sm {
                              height: 28px;
                              padding: 4px 10px;
                              width: 100%;
                              border: 1px solid #dddbda;
                              border-radius: 4px;
                              font-size: 12px;
                              color: #212529;
                              background-color: #ffffff;
                              cursor: not-allowed;
                              opacity: 0.5;
                            }
                          

/* [FRM-02] Select, Checkbox & Toggle — Select Dropdown (Options List) */

                        /* Popover panel */
                        .form-select__content {
                          position: absolute;
                          z-index: 50;
                          min-width: 128px;
                          max-height: 96vh;
                          overflow: hidden;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          background-color: #ffffff;
                          color: #212529;
                          box-shadow:
                            0 4px 6px -1px rgba(0, 0, 0, 0.1),
                            0 2px 4px -2px rgba(0, 0, 0, 0.1);
                          padding: 4px;
                        }

                        /* Each option row */
                        .form-select__item {
                          position: relative;
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          width: 100%;
                          padding: 6px 32px 6px 8px;
                          border-radius: 2px;
                          font-size: 14px;
                          cursor: default;
                          user-select: none;
                        }
                        .form-select__item:hover,
                        .form-select__item--highlighted {
                          background-color: #f9fafb;
                          color: #145f33;
                        }
                        .form-select__item--disabled {
                          pointer-events: none;
                          opacity: 0.5;
                        }

                        /* Checkmark on the currently-selected option */
                        .form-select__item-check {
                          position: absolute;
                          right: 8px;
                          top: 50%;
                          transform: translateY(-50%);
                          width: 16px;
                          height: 16px;
                        }

                        /* The real open/close motion comes from Radix's data-state attribute
   plus an animation plugin, and isn't reproduced exactly — this is a
   close, portable approximation of it: */
                        .form-select__content[data-state="open"] {
                          animation: form-select-in 150ms
                            ease-out;
                        }
                        @keyframes form-select-in {
                          from {
                            opacity: 0;
                            transform: scale(0.95);
                          }
                          to {
                            opacity: 1;
                            transform: scale(1);
                          }
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Checkbox Checked */

                        .checkbox--checked {
                          width: 16px;
                          height: 16px;
                          border-radius: 4px;
                          background-color: #145f33;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Checkbox Unchecked */

                        .checkbox--unchecked {
                          width: 16px;
                          height: 16px;
                          border-radius: 4px;
                          border: 1px solid #c9c7c5;
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Checkbox Disabled On */

                        .checkbox--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Checkbox Disabled Off */

                        .checkbox--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Toggle On */

                        .toggle--on {
                          width: 36px;
                          height: 20px;
                          border-radius: 9999px;
                          position: relative;
                          background-color: #145f33;
                        }
                        
.toggle-thumb {
                          position: absolute;
                          top: 2px;
                          right: 2px;
                          width: 16px;
                          height: 16px;
                          border-radius: 9999px;
                          background-color: #ffffff;
                          box-shadow: 0 1px 3px
                            rgba(0, 0, 0, 0.2);
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Toggle Off */

                        .toggle--off {
                          width: 36px;
                          height: 20px;
                          border-radius: 9999px;
                          position: relative;
                          background-color: #9e9e9c;
                        }
                        
.toggle-thumb {
                          position: absolute;
                          top: 2px;
                          left: 2px;
                          width: 16px;
                          height: 16px;
                          border-radius: 9999px;
                          background-color: #ffffff;
                          box-shadow: 0 1px 3px
                            rgba(0, 0, 0, 0.2);
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Toggle Disabled On */

                        .toggle--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      

/* [FRM-02] Select, Checkbox & Toggle — Toggle Disabled Off */

                        .toggle--disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                          pointer-events: none;
                        }
                      

/* [FRM-04] Password Input */
.form-input--password { height: 36px; padding: 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }
.form-input--password:hover { border-color: #b0adab; }
.form-input--password:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }
.form-input--password--readonly { background-color: #fafaf9; cursor: not-allowed; }
.form-input--password--disabled { background-color: #f3f2f2; cursor: not-allowed; }
.form-input--password--error { border-color: #A82031; }

/* [FRM-04] Password Input — Password Default, Medium — 36px */

                        .form-input--password {
                          height: 36px;
                          padding: 0 36px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #ffffff;
                        }
                      

/* [FRM-04] Password Input — Password Default, Small — 28px */

                        .form-input--password--sm {
                          height: 28px;
                          padding: 0 30px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #ffffff;
                        }
                      

/* [FRM-04] Password Input — Password Hover, Medium — 36px */

                        .form-input--password:hover {
                          border-color: #b0adab;
                        }
                      

/* [FRM-04] Password Input — Password Hover, Small — 28px */

                        .form-input--password--sm:hover {
                          border-color: #b0adab;
                        }
                      

/* [FRM-04] Password Input — Password Focus, Medium — 36px */

                        .form-input--password:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      

/* [FRM-04] Password Input — Password Focus, Small — 28px */

                        .form-input--password--sm:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      

/* [FRM-04] Password Input — Password Read-only, Medium — 36px */

                        .form-input--password--readonly {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      

/* [FRM-04] Password Input — Password Read-only, Small — 28px */

                        .form-input--password--readonly--sm {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      

/* [FRM-04] Password Input — Password Disabled, Medium — 36px */

                        .form-input--password--disabled {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      

/* [FRM-04] Password Input — Password Disabled, Small — 28px */

                        .form-input--password--disabled--sm {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      

/* [FRM-04] Password Input — Password Error, Medium — 36px */

                        .form-input--password--error {
                          border: 1px solid #a82031;
                        }
                        
.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      

/* [FRM-04] Password Input — Password Error, Small — 28px */

                        .form-input--password--error--sm {
                          border: 1px solid #a82031;
                        }
                      

/* [FRM-05] Email Input */
.form-input--email { height: 36px; padding: 0 12px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }
.form-input--email:hover { border-color: #b0adab; }
.form-input--email:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }
.form-input--email--readonly { background-color: #fafaf9; cursor: not-allowed; }
.form-input--email--disabled { background-color: #f3f2f2; cursor: not-allowed; }
.form-input--email--error { border-color: #A82031; }

/* [FRM-05] Email Input — Guardian Email Default, Medium — 36px */

                        .form-input--email {
                          height: 36px;
                          padding: 0 12px 0 36px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 13px;
                          background-color: #ffffff;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Default, Small — 28px */

                        .form-input--email--sm {
                          height: 28px;
                          padding: 0 10px 0 30px;
                          width: 100%;
                          border: 1px solid #dddbda;
                          border-radius: 4px;
                          font-size: 12px;
                          background-color: #ffffff;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Hover, Medium — 36px */

                        .form-input--email:hover {
                          border-color: #b0adab;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Hover, Small — 28px */

                        .form-input--email--sm:hover {
                          border-color: #b0adab;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Focus, Medium — 36px */

                        .form-input--email:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Focus, Small — 28px */

                        .form-input--email--sm:focus {
                          border-color: #145f33;
                          box-shadow: 0 0 0 3px
                            rgba(20, 95, 51, 0.2);
                          outline: none;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Read-only, Medium — 36px */

                        .form-input--email--readonly {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Read-only, Small — 28px */

                        .form-input--email--readonly--sm {
                          background-color: #fafaf9;
                          cursor: not-allowed;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Disabled, Medium — 36px */

                        .form-input--email--disabled {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Disabled, Small — 28px */

                        .form-input--email--disabled--sm {
                          background-color: #f3f2f2;
                          cursor: not-allowed;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Error, Medium — 36px */

                        .form-input--email--error {
                          border: 1px solid #a82031;
                        }
                        
.form-error-msg {
                          font-size: 11px;
                          color: #a82031;
                          margin-top: 4px;
                        }
                      

/* [FRM-05] Email Input — Guardian Email Error, Small — 28px */

                        .form-input--email--error--sm {
                          border: 1px solid #a82031;
                        }
                      

/* [FRM-06] Number Input */
.form-input--number { height: 36px; padding: 0 12px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }
.form-input--number:hover { border-color: #b0adab; }
.form-input--number:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }
.form-input--number--readonly { background-color: #fafaf9; cursor: not-allowed; }
.form-input--number--disabled { background-color: #f3f2f2; cursor: not-allowed; }
.form-input--number--error { border-color: #A82031; }


/* [FRM-07] Search Box */
.form-input--search { height: 36px; padding: 0 36px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }
.form-input--search:hover { border-color: #b0adab; }
.form-input--search:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }
.form-input--search--readonly { background-color: #fafaf9; cursor: not-allowed; }
.form-input--search--disabled { background-color: #f3f2f2; cursor: not-allowed; }
.form-input--search--error { border-color: #A82031; }


/* [FRM-08] Combobox */
.combobox-trigger { height: 36px; padding: 0 36px 0 36px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; display: flex; align-items: center; }
.combobox-trigger:hover { border-color: #b0adab; }
.combobox-trigger:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }
.combobox-trigger--readonly { background-color: #fafaf9; cursor: not-allowed; }
.combobox-trigger--disabled { background-color: #f3f2f2; cursor: not-allowed; }
.combobox-trigger--error { border-color: #A82031; }
.combobox-list { border: 1px solid #dddbda; border-radius: 8px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 4px 0; margin-top: 4px; }
.combobox-option { padding: 6px 12px; font-size: 13px; cursor: pointer; }
.combobox-option:hover { background-color: #f3f2f2; }
.combobox-option--selected { background-color: rgba(20,95,51,0.08); color: #145F33; }


/* [FRM-08] Combobox — Combobox Open state, with results list (combobox-list / combobox-option--selected) */

                      .combobox-list {
                        border: 1px solid #dddbda;
                        border-radius: 8px;
                        background-color: #ffffff;
                        box-shadow: 0 4px 12px
                          rgba(0, 0, 0, 0.1);
                        padding: 4px 0;
                      }
                      
.combobox-option--selected {
                        background-color: rgba(
                          20,
                          95,
                          51,
                          0.08
                        );
                        color: #145f33;
                      }
                    

/* [FRM-09] File Upload */
.file-dropzone { border: 1px dashed #dddbda; border-radius: 4px; background-color: #ffffff; padding: 20px; text-align: center; }
.file-dropzone:hover { border-color: #b0adab; background-color: #fafaf9; }
.file-dropzone:focus-within { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); }
.file-dropzone--readonly { background-color: #fafaf9; cursor: not-allowed; }
.file-dropzone--disabled { background-color: #f3f2f2; cursor: not-allowed; opacity: 0.6; }
.file-dropzone--error { border-color: #A82031; border-style: solid; }
.file-upload-compact { height: 28px; display: inline-flex; align-items: center; gap: 8px; }
.file-upload-compact__btn { height: 28px; padding: 0 10px; border: 1px solid #dddbda; border-radius: 4px; font-size: 12px; background-color: #ffffff; }

`;
}

function newComponentSectionsCSS(): string {
  return `
/* [RAD-01] Vertical Group */
.radio-item { display: flex; align-items: center; gap: 8px; }
[data-state=checked] .radio-indicator { background-color: #145F33; border-color: #145F33; }

/* [RAD-02] Horizontal Group */
.radio-item { display: flex; align-items: center; gap: 8px; }
[data-state=checked] .radio-indicator { background-color: #145F33; border-color: #145F33; }

/* [TXA-01] Textarea States (cssCode) */
.textarea {
  width: 100%;
  min-height: 64px;
  padding: 8px 12px;
  border: 1px solid #dddbda;
  border-radius: 4px;
  font-size: 13px;
  background-color: #ffffff;
  resize: none;
}
.textarea:focus {
  border-color: #145F33;
  box-shadow: 0 0 0 3px rgba(20,95,51,0.2);
  outline: none;
}
.textarea--readonly {
  background-color: #fafaf9;
  cursor: not-allowed;
}
.textarea--disabled {
  background-color: #f3f2f2;
  cursor: not-allowed;
  opacity: 0.6;
}
.textarea--error {
  border-color: #A82031;
}
.textarea-error-msg {
  font-size: 11px;
  color: #A82031;
  margin-top: 4px;
}

/* [TXA-01] Textarea States — Notes (default with value) */
.textarea { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; resize: none; }

/* [TXA-01] Textarea States — Comments (placeholder) */
.textarea--placeholder { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; color: #9e9e9c; resize: none; }

/* [TXA-01] Textarea States — Incident Summary (error, static) */
.textarea--error { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #A82031; border-radius: 4px; font-size: 13px; resize: none; }
.textarea-error-msg { font-size: 11px; color: #A82031; margin-top: 4px; }

/* [TXA-01] Textarea States — Incident Summary (error, live character-count driven) */
.textarea--error { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #A82031; border-radius: 4px; font-size: 13px; resize: none; }
.textarea-error-msg { font-size: 11px; color: #A82031; margin-top: 4px; }

/* [TXA-01] Textarea States — Case History (read-only) */
.textarea--readonly { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #fafaf9; cursor: not-allowed; resize: none; }

/* [TXA-01] Textarea States — Discharge Notes (disabled) */
.textarea--disabled { width: 100%; min-height: 64px; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #f3f2f2; cursor: not-allowed; opacity: 0.6; resize: none; }

/* [TXA-01] Textarea States — Search Notes (focus state) */
.textarea:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }

/* [TXA-02] Textarea with Character Counter (cssCode) */
.textarea-wrap {
  position: relative;
}
.textarea-char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: #706e6b;
  background-color: #ffffff;
  padding: 0 2px;
}
.textarea-char-count--limit {
  color: #A82031;
  font-weight: 500;
}

/* [TXA-02] Textarea with Character Counter — Case Summary */
.textarea-wrap { position: relative; }
.textarea-char-count { position: absolute; bottom: 8px; right: 12px; font-size: 11px; color: #706e6b; background-color: #ffffff; padding: 0 2px; }
.textarea-char-count--limit { color: #A82031; font-weight: 500; }

/* [DPK-01] Default — No Selection (cssCode) */
.date-picker-trigger { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 36px; padding: 0 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background: #ffffff; cursor: pointer; }
.date-picker-trigger--sm { height: 28px; padding: 0 10px; font-size: 12px; }
.date-picker-trigger:hover { border-color: #145F33; }

/* [DPK-01] Default — No Selection — Medium, 36px */
                      .date-picker-trigger {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [DPK-01] Default — No Selection — Small, 28px */
                      .date-picker-trigger--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [DPK-02] Pre-selected Date (cssCode) */
.date-picker-trigger { height: 36px; padding: 0 12px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: space-between; }
.date-picker-trigger--sm { height: 28px; padding: 0 10px; font-size: 12px; }

/* [DPK-02] Pre-selected Date — Medium, 36px */
                      .date-picker-trigger {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [DPK-02] Pre-selected Date — Small, 28px */
                      .date-picker-trigger--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [DPK-03] Disabled (cssCode) */
.date-picker-trigger[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.date-picker-trigger--sm[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* [DPK-03] Disabled — Medium, 36px */
                      .date-picker-trigger[aria-disabled="true"] {
                        opacity: 0.5;
                        cursor: not-allowed;
                        pointer-events: none;
                      }

/* [DPK-03] Disabled — Small, 28px */
                      .date-picker-trigger--sm[aria-disabled="true"] {
                        opacity: 0.5;
                        cursor: not-allowed;
                        pointer-events: none;
                      }

/* [DPK-04] With Required Label (cssCode) */
.date-picker-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #706e6b; }
.date-picker-required { color: #c23934; }

/* [DPK-04] With Required Label — Medium, 36px */
                      .date-picker-trigger {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [DPK-04] With Required Label — Small, 28px */
                      .date-picker-trigger--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background: #ffffff;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [DPK-05] Focused (cssCode) */
.date-picker-trigger:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }

/* [DPK-05] Focused — Medium, 36px */
                      .date-picker-trigger:focus {
                        border-color: #145f33;
                        box-shadow: 0 0 0 3px
                          rgba(20, 95, 51, 0.2);
                        outline: none;
                      }

/* [DPK-05] Focused — Small, 28px */
                      .date-picker-trigger--sm:focus {
                        border-color: #145f33;
                        box-shadow: 0 0 0 3px
                          rgba(20, 95, 51, 0.2);
                        outline: none;
                      }

/* [DPK-06] Read-Only (cssCode) */
.date-picker-trigger--readonly { height: 36px; padding: 0 12px; width: 100%; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #fafaf9; cursor: not-allowed; color: #080707; display: inline-flex; align-items: center; justify-content: space-between; }
.date-picker-trigger--readonly--sm { height: 28px; padding: 0 10px; font-size: 12px; }

/* [DPK-06] Read-Only — Medium, 36px */
                      .date-picker-trigger--readonly {
                        height: 36px;
                        padding: 0 12px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 13px;
                        background-color: #fafaf9;
                        cursor: not-allowed;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [DPK-06] Read-Only — Small, 28px */
                      .date-picker-trigger--readonly--sm {
                        height: 28px;
                        padding: 0 10px;
                        width: 100%;
                        border: 1px solid #dddbda;
                        border-radius: 4px;
                        font-size: 12px;
                        background-color: #fafaf9;
                        cursor: not-allowed;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                      }

/* [CAL-01] Single Selection */
.calendar-day--selected { background-color: #145F33; color: #ffffff; border-radius: 4px; }
.calendar-day:hover:not(.calendar-day--selected):not(.calendar-day--disabled) { background-color: #f3f2f2; border-radius: 4px; }
.calendar-day--disabled { opacity: 0.4; cursor: not-allowed; }

/* [CAL-02] Multiple Selection */
.calendar-day--selected { background-color: #145F33; color: #ffffff; border-radius: 4px; }
.calendar-day:hover:not(.calendar-day--selected):not(.calendar-day--disabled) { background-color: #f3f2f2; border-radius: 4px; }

/* [CAL-03] Range Selection */
.calendar-day--range-start, .calendar-day--range-end { background-color: #145F33; color: #ffffff; border-radius: 4px; }
.calendar-day--range-middle { background-color: rgba(20,95,51,0.1); border-radius: 0; }

/* [CAL-04] Disabled Dates */
.calendar-day--disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
.calendar-day:not(.calendar-day--disabled):hover { background-color: #f3f2f2; border-radius: 4px; }

/* [OTP-01] 6-Digit OTP */
.otp-slot { width: 44px; height: 44px; border: 1px solid #dddbda; border-radius: 6px; font-size: 18px; font-weight: 500; text-align: center; display: flex; align-items: center; justify-content: center; }
.otp-slot--focused { border-color: #145F33; box-shadow: 0 0 0 2px rgba(20,95,51,0.2); }
.otp-separator { font-size: 18px; color: #706e6b; padding: 0 4px; }

/* [OTP-02] 4-Digit PIN */
.otp-slot { width: 44px; height: 44px; border: 1px solid #dddbda; border-radius: 6px; font-size: 18px; font-weight: 500; text-align: center; display: flex; align-items: center; justify-content: center; }
.otp-slot--focused { border-color: #145F33; box-shadow: 0 0 0 2px rgba(20,95,51,0.2); }

/* [OTP-03] Filled State */
.otp-slot { width: 44px; height: 44px; border: 1px solid #dddbda; border-radius: 6px; font-size: 18px; font-weight: 500; text-align: center; display: flex; align-items: center; justify-content: center; }
.otp-slot--filled { border-color: #145F33; }
.otp-separator { font-size: 18px; color: #706e6b; padding: 0 4px; }

/* [ACC-01] Single (Collapsible) */
.accordion-item {
  border-bottom: 1px solid #dddbda;
}
.accordion-item:last-child {
  border-bottom: none;
}

.accordion-trigger {
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-radius: 6px;
  padding: 16px 0;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accordion-trigger:hover {
  text-decoration: underline;
}

.accordion-trigger-icon {
  width: 16px;
  height: 16px;
  color: #717182;
  flex-shrink: 0;
  transform: translateY(2px);
  transition: transform 0.2s ease;
}

.accordion-trigger[data-state="open"] .accordion-trigger-icon {
  transform: translateY(2px) rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  font-size: 13px;
  color: #706e6b;
}

.accordion-content-inner {
  padding-top: 0;
  padding-bottom: 16px;
}

/* [ACC-02] Multiple */
.accordion-item {
  border-bottom: 1px solid #dddbda;
}
.accordion-item:last-child {
  border-bottom: none;
}

.accordion-trigger {
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-radius: 6px;
  padding: 16px 0;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accordion-trigger:hover {
  text-decoration: underline;
}

.accordion-trigger-icon {
  width: 16px;
  height: 16px;
  color: #717182;
  flex-shrink: 0;
  transform: translateY(2px);
  transition: transform 0.2s ease;
}

.accordion-trigger[data-state="open"] .accordion-trigger-icon {
  transform: translateY(2px) rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  font-size: 13px;
  color: #706e6b;
}

.accordion-content-inner {
  padding-top: 0;
  padding-bottom: 16px;
}

/* [DRP-01] Basic with Icons */
.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }
.dropdown-content { min-width: 200px; border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 4px; }
.dropdown-item { padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }
.dropdown-item:hover { background-color: #f3f2f2; }

/* [DRP-02] Checkbox Items */
.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }
.dropdown-checkbox-item { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }
.dropdown-checkbox-item:hover { background-color: #f3f2f2; }
.dropdown-checkbox-item[data-state=checked]::before { content: "✓"; color: #145F33; font-weight: 600; }

/* [DRP-03] Radio Items */
.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }
.dropdown-radio-item { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }
.dropdown-radio-item:hover { background-color: #f3f2f2; }
.dropdown-radio-item[data-state=checked] { font-weight: 500; color: #145F33; }

/* [DRP-04] Submenu */
.dropdown-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; cursor: pointer; background: #ffffff; }
.dropdown-sub-trigger { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 12px; font-size: 13px; border-radius: 4px; cursor: pointer; }
.dropdown-sub-trigger:hover { background-color: #f3f2f2; }
.dropdown-sub-content { border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 4px; }

/* [DRW-01] Placements — per-direction copy button, static CSS repeated for each of Bottom/Right/Top/Left in the .map() */
.drawer-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.4); }
.drawer-content { position: fixed; bottom: 0; left: 0; right: 0; background-color: #ffffff; border-radius: 12px 12px 0 0; padding: 24px; max-height: 85vh; overflow-y: auto; }
.drawer-handle { width: 48px; height: 4px; border-radius: 9999px; background-color: #dddbda; margin: 0 auto 16px; }

/* [SLD-01] Single Value */
.slider-track { height: 6px; border-radius: 9999px; background-color: #dddbda; position: relative; }
.slider-range { height: 100%; background-color: #145F33; border-radius: 9999px; }
.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }

/* [SLD-02] Range */
.slider-track { height: 6px; border-radius: 9999px; background-color: #dddbda; position: relative; }
.slider-range { height: 100%; background-color: #145F33; border-radius: 9999px; }
.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }

/* [SLD-03] Disabled */
.slider-track { height: 6px; border-radius: 9999px; background-color: #dddbda; position: relative; opacity: 0.5; }
.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; cursor: not-allowed; }

/* [SLD-04] Vertical Orientation */
.slider-track--vertical { width: 6px; height: 100%; border-radius: 9999px; background-color: #dddbda; position: relative; }
.slider-range--vertical { width: 100%; background-color: #145F33; border-radius: 9999px; }
.slider-thumb { width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }

/* [PGN-01] Interactive Pagination */
.pagination { display: flex; align-items: center; gap: 4px; }
.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }
.pagination-btn--active { background-color: #145F33; color: #ffffff; border-color: #145F33; }
.pagination-btn:hover:not(.pagination-btn--active) { background-color: #f3f2f2; }

/* [PGN-02] Beginning (page 1) */
.pagination { display: flex; align-items: center; gap: 4px; }
.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* [PGN-03] Middle (page 12) */
.pagination { display: flex; align-items: center; gap: 4px; }
.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }
.pagination-btn:hover { background-color: #f3f2f2; }

/* [PGN-04] End (page 24) */
.pagination { display: flex; align-items: center; gap: 4px; }
.pagination-btn { width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid #dddbda; cursor: pointer; font-size: 13px; }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* [TGL-01] Variants */
.toggle-btn { padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #dddbda; background: none; }
.toggle-btn[data-state=on] { background-color: #f3f2f2; font-weight: 500; border-color: #c9c7c5; }

/* [TGL-02] Sizes */
.toggle-btn { padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #dddbda; background: none; }
.toggle-btn--sm { padding: 4px 8px; font-size: 12px; }
.toggle-btn--lg { padding: 8px 16px; font-size: 14px; }

/* [TGL-03] With Text Labels */
.toggle-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #dddbda; background: none; }
.toggle-btn[data-state=on] { background-color: #f3f2f2; font-weight: 500; }

/* [TGL-04] Disabled States */
.toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.toggle-btn[data-state=on]:disabled { background-color: #f3f2f2; }

/* [TGG-01] Single Selection */
.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }
.toggle-group-item { padding: 6px 12px; font-size: 13px; border-right: 1px solid #dddbda; background: none; cursor: pointer; }
.toggle-group-item:last-child { border-right: none; }
.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; }

/* [TGG-02] Multiple Selection */
.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }
.toggle-group-item { padding: 6px 12px; font-size: 13px; border-right: 1px solid #dddbda; background: none; cursor: pointer; }
.toggle-group-item:last-child { border-right: none; }
.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; }

/* [TGG-03] Text Labels — Single */
.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }
.toggle-group-item { padding: 6px 16px; font-size: 13px; border-right: 1px solid #dddbda; background: none; cursor: pointer; }
.toggle-group-item:last-child { border-right: none; }
.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; font-weight: 500; }

/* [TGG-04] Sizes (sm / default / lg) */
.toggle-group { display: flex; border: 1px solid #dddbda; border-radius: 4px; overflow: hidden; }
.toggle-group-item--sm { padding: 4px 8px; font-size: 12px; }
.toggle-group-item--default { padding: 6px 12px; font-size: 13px; }
.toggle-group-item--lg { padding: 8px 16px; font-size: 14px; }
.toggle-group-item[data-state=on] { background-color: #145F33; color: #ffffff; }

/* [ALD-01] Confirmation */
.alert-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
}

.alert-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: calc(100% - 2rem);
  padding: 24px;
  background-color: #f9fafb;
  border: 1px solid #dddbda;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
@media (min-width: 640px) {
  .alert-dialog-content { max-width: 32rem; }
}

.alert-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
@media (min-width: 640px) {
  .alert-dialog-header { text-align: left; }
}

.alert-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.alert-dialog-description {
  font-size: 13px;
  color: #717182;
}

.alert-dialog-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
@media (min-width: 640px) {
  .alert-dialog-footer { flex-direction: row; justify-content: flex-end; }
}

/* [ALD-02] Destructive */
.alert-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
}

.alert-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: calc(100% - 2rem);
  padding: 24px;
  background-color: #f9fafb;
  border: 1px solid #dddbda;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
@media (min-width: 640px) {
  .alert-dialog-content { max-width: 32rem; }
}

.alert-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
@media (min-width: 640px) {
  .alert-dialog-header { text-align: left; }
}

.alert-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.alert-dialog-description {
  font-size: 13px;
  color: #717182;
}

.alert-dialog-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
@media (min-width: 640px) {
  .alert-dialog-footer { flex-direction: row; justify-content: flex-end; }
}

/* [ALD-03] Warning */
.alert-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
}

.alert-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: calc(100% - 2rem);
  padding: 24px;
  background-color: #f9fafb;
  border: 1px solid #dddbda;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
@media (min-width: 640px) {
  .alert-dialog-content { max-width: 32rem; }
}

.alert-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
@media (min-width: 640px) {
  .alert-dialog-header { text-align: left; }
}

.alert-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.alert-dialog-description {
  font-size: 13px;
  color: #717182;
}

.alert-dialog-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
@media (min-width: 640px) {
  .alert-dialog-footer { flex-direction: row; justify-content: flex-end; }
}

/* [TST-01] Toast Types — Success button */
.toast--success { background-color: #ffffff; border: 1px solid #a8d5b8; border-left: 4px solid #145F33; border-radius: 8px; padding: 12px 16px; display: flex; align-items: flex-start; gap: 12px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.toast-icon--success { color: #145F33; }

/* [TST-01] Toast Types — Error button */
.toast--error { border-left-color: #A82031; border-color: #f48fb1; }
.toast-icon--error { color: #A82031; }

/* [TST-01] Toast Types — Warning button */
.toast--warning { border-left-color: #E86C24; border-color: #fcd34d; }
.toast-icon--warning { color: #E86C24; }

/* [TST-01] Toast Types — Info button */
.toast--info { border-left-color: #005EA2; border-color: #7dd3fc; }
.toast-icon--info { color: #005EA2; }

`;
}

function vmsKpiDialogSectionsCSS(): string {
  return `
/* ===== FILE: VMSPortedSections.tsx ===== */

/* [RTG-01] Interactive — for scoring in a form */
.star-rating { display: flex; align-items: center; gap: 4px; }
.star-rating__btn { background: none; border: none; padding: 0; cursor: pointer; line-height: 0; }
.star-rating__icon { width: 20px; height: 20px; color: #dddbda; }
.star-rating__icon--filled { color: #b28500; fill: #b28500; }

/* [RTG-02] Read-only — for display in a list or record */
.star-rating--readonly .star-rating__icon { cursor: default; }
.star-rating__summary { font-size: 12px; color: #706e6b; margin-left: 6px; }

/* [SSN-01] Entry — form input */
.form-label { display: block; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #706e6b; margin-bottom: 4px; }
.ssn-input { width: 100%; height: 36px; padding: 0 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }
.ssn-input:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.15); outline: none; }
.ssn-help { font-size: 11px; color: #706e6b; margin-top: 4px; }

/* [SSN-02] Display — reveal / hide */
.ssn-display { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.ssn-display__toggle { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; background: none; border: none; cursor: pointer; color: #706e6b; }
.ssn-display__toggle:hover { background-color: #f3f2f2; }
.ssn-display__badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 9999px; background-color: #fce4ec; color: #A82031; }

/* [DOC-01] Scrollable document panel */
.doc-panel { max-height: 160px; overflow-y: auto; padding: 14px 16px; border: 1px solid #dddbda; border-radius: 8px; background-color: #fafaf9; font-size: 12px; line-height: 1.6; color: #3e3e3c; }

/* [DOC-02] Agreement action bar */
.doc-agree-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 12px; border-top: 1px solid #ecebea; }
.doc-agree-checkbox { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #3e3e3c; }
.doc-agree-checkbox input { margin-top: 2px; accent-color: #145F33; }

/* [SIG-01] Draw mode */
.sig-mode-toggle { display: inline-flex; border: 1px solid #dddbda; border-radius: 8px; overflow: hidden; }
.sig-mode-toggle button { padding: 6px 14px; font-size: 12px; font-weight: 500; background-color: #ffffff; color: #706e6b; border: none; cursor: pointer; }
.sig-mode-toggle button.active { background-color: #145F33; color: #ffffff; }
.sig-canvas { width: 100%; max-width: 320px; height: 110px; border: 1px dashed #c9c7c5; border-radius: 8px; background-color: #fafaf9; cursor: crosshair; }

/* [SIG-02] Signed — locked state */
.sig-locked { width: 100%; max-width: 320px; padding: 14px; border: 1px solid #a8d5b8; border-radius: 8px; background-color: #f4faf6; }
.sig-locked__mark { font-family: 'Segoe Script', 'Brush Script MT', cursive; font-size: 24px; color: #145F33; }
.sig-locked__meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #706e6b; margin-top: 8px; }
.sig-locked__reset { font-size: 11px; color: #706e6b; text-decoration: underline; background: none; border: none; cursor: pointer; }

/* [MTR-01] Mentor search result */
.mentor-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; }
.mentor-row__avatar { width: 36px; height: 36px; border-radius: 9999px; background-color: #145F33; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.mentor-row__name { font-size: 13px; font-weight: 600; color: #080707; }
.mentor-row__meta { font-size: 11px; color: #706e6b; display: flex; align-items: center; gap: 10px; margin-top: 2px; }

/* [MTR-02] Match suggestion card */
.match-card { width: 320px; padding: 14px; border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; }
.match-card__score-track { height: 6px; border-radius: 9999px; background-color: #ecebea; overflow: hidden; margin: 8px 0; }
.match-card__score-fill { height: 100%; background-color: #145F33; border-radius: 9999px; }
.match-card__tag { font-size: 11px; padding: 2px 8px; border-radius: 9999px; background-color: #f3f2f2; color: #706e6b; }

/* [MTR-03] Activity log — CB vs WB/SB */
.activity-toggle { display: inline-flex; border: 1px solid #dddbda; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
.activity-toggle button { padding: 6px 14px; font-size: 12px; font-weight: 500; background-color: #ffffff; color: #706e6b; border: none; cursor: pointer; }
.activity-toggle button.active { background-color: #145F33; color: #ffffff; }
.attendance-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #ecebea; font-size: 12px; }
.attendance-pill { font-size: 11px; padding: 2px 10px; border-radius: 9999px; font-weight: 500; }
.attendance-pill--present { background-color: #e6f4ea; color: #145F33; }
.attendance-pill--absent { background-color: #fce4ec; color: #A82031; }


/* ===== FILE: KPICardsSection.tsx ===== */

/* [KPI-01] Metric Card — Icon Badge Variants */
.kpi-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 16px; cursor: pointer; }
.kpi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.kpi-icon--blue { background-color: #dbeafe; }
.kpi-icon--purple { background-color: #ede9fe; }
.kpi-icon--teal { background-color: #ccfbf1; }
.kpi-icon--red { background-color: #fee2e2; }
.kpi-icon { width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; }

/* [KPI-02] Metric Card — Status Variants */
.kpi-card--plain { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 16px; cursor: pointer; }
.kpi-card--plain:hover { background-color: var(--slds-g-color-background-alt); }
.kpi-card--selected { border-radius: 8px; border: 2px solid #145F33; background-color: #f4faf6; padding: 16px; cursor: pointer; }
.kpi-card--disabled { opacity: 0.5; cursor: not-allowed; }
.kpi-card__check { flex-shrink: 0; width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; color: #ffffff; display: flex; align-items: center; justify-content: center; }

/* [KPI-03] Metric Card — Trend Variants */
.trend-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 20px; box-shadow: var(--slds-g-shadow-1); }
.trend-card__accent-top { height: 4px; }
.trend-card__value { font-size: 2rem; font-weight: 700; line-height: 1; }
.trend-card__trend--up { color: #2e844a; }
.trend-card__trend--down { color: #A82031; }
.trend-card__progress-track { height: 6px; border-radius: 9999px; background-color: #f3f2f2; overflow: hidden; margin-top: 12px; }
.trend-card__progress-fill { height: 100%; border-radius: 9999px; background-color: #145F33; }

/* [KPI-04] Metric Card — Circular Progress Ring */
.progress-ring-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 24px; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.07); }
.progress-ring-card__value { font-size: 2.5rem; font-weight: 700; line-height: 1; }
.progress-ring-card__footer { padding-top: 12px; border-top: 1px solid #dddbda; font-size: 13px; }

/* [KPI-05] Metric Card — Mini Sparkline */
.sparkline-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 24px; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.07); }
.sparkline-card__value { font-size: 2.5rem; font-weight: 700; line-height: 1; }
.sparkline-card__trend-chip--down { color: #E86C24; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }

/* [KPI-06] Metric Card — Simple Stat with Footer */
.stat-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 24px; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.07); }
.stat-card__value { font-size: 2.5rem; font-weight: 700; line-height: 1; }
.stat-card__footer { padding-top: 12px; border-top: 1px solid #dddbda; font-size: 13px; }


/* ===== FILE: DialogSection.tsx ===== */

/* [DLG-01] Dialog Variants — Copy CSS — MD */
              /* ── Dialog MD (max-width: 448px) ── */

              /* Backdrop */
              .dialog-backdrop {
                position: fixed;
                inset: 0;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
              }

              /* Modal container */
              .dialog {
                position: relative;
                z-index: 51;
                width: 100%;
                max-width: 448px;
                background-color: #ffffff;
                border: 1px solid #dddbda;
                border-radius: 8px;
                box-shadow:
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-height: calc(100vh - 32px);
              }

              /* Header */
              .dialog__header {
                padding: 16px 20px;
                border-bottom: 1px solid #dddbda;
                flex-shrink: 0;
              }

              .dialog__title {
                font-size: 16px;
                font-weight: 500;
                line-height: 24px;
                color: #080707;
                margin: 0;
              }

              /* Body */
              .dialog__body {
                padding: 16px 20px;
                overflow-y: auto;
                flex: 1;
              }

              /* Footer */
              .dialog__footer {
                padding: 12px 20px;
                border-top: 1px solid #dddbda;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-shrink: 0;
                background-color: #ffffff;
              }

              /* Close button */
              .dialog__close {
                position: absolute;
                top: 14px;
                right: 16px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                color: #706e6b;
                opacity: 0.7;
              }
              .dialog__close:hover {
                opacity: 1;
                background-color: #f3f2f2;
              }

/* [DLG-01] Dialog Variants — Copy CSS — LG */
              /* ── Dialog LG (max-width: 576px) ── */

              /* Backdrop */
              .dialog-backdrop {
                position: fixed;
                inset: 0;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
              }

              /* Modal container */
              .dialog--lg {
                position: relative;
                z-index: 51;
                width: 100%;
                max-width: 576px;
                background-color: #ffffff;
                border: 1px solid #dddbda;
                border-radius: 8px;
                box-shadow:
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-height: calc(100vh - 32px);
              }

              /* Header */
              .dialog--lg .dialog__header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid #dddbda;
                flex-shrink: 0;
              }

              .dialog--lg .dialog__title {
                font-size: 16px;
                font-weight: 600;
                line-height: 24px;
                color: #080707;
                margin: 0 0 2px;
              }

              .dialog--lg .dialog__subtitle {
                font-size: 13px;
                color: #706e6b;
                margin: 0;
              }

              /* Body */
              .dialog--lg .dialog__body {
                padding: 20px 24px;
                overflow-y: auto;
                flex: 1;
              }

              /* Two-column grid inside LG dialog */
              .dialog--lg .dialog__grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
              }

              /* Footer */
              .dialog--lg .dialog__footer {
                padding: 14px 24px;
                border-top: 1px solid #dddbda;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-shrink: 0;
                background-color: #ffffff;
              }

              /* Close button */
              .dialog--lg .dialog__close {
                position: absolute;
                top: 16px;
                right: 20px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                color: #706e6b;
                opacity: 0.7;
              }
              .dialog--lg .dialog__close:hover {
                opacity: 1;
                background-color: #f3f2f2;
              }

/* [DLG-01] Dialog Variants — Copy CSS — XL */
              /* ── Dialog XL (max-width: 820px, scrollable long form) ── */

              /* Backdrop */
              .dialog-backdrop {
                position: fixed;
                inset: 0;
                z-index: 50;
                background-color: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
              }

              /* Modal container */
              .dialog--xl {
                position: relative;
                z-index: 51;
                width: 100%;
                max-width: 820px;
                background-color: #ffffff;
                border: 1px solid #dddbda;
                border-radius: 8px;
                box-shadow:
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-height: 90vh;
              }

              /* Header */
              .dialog--xl .dialog__header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid #dddbda;
                flex-shrink: 0;
              }

              .dialog--xl .dialog__title {
                font-size: 16px;
                font-weight: 600;
                line-height: 24px;
                color: #080707;
                margin: 0 0 2px;
              }

              .dialog--xl .dialog__subtitle {
                font-size: 13px;
                color: #706e6b;
                margin: 0;
              }

              /* Scrollable body */
              .dialog--xl .dialog__body {
                padding: 20px 24px;
                overflow-y: auto;
                flex: 1;
              }

              /* Footer */
              .dialog--xl .dialog__footer {
                padding: 14px 24px;
                border-top: 1px solid #dddbda;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                flex-shrink: 0;
                background-color: #ffffff;
              }

              /* Close button */
              .dialog--xl .dialog__close {
                position: absolute;
                top: 16px;
                right: 20px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                color: #706e6b;
                opacity: 0.7;
              }
              .dialog--xl .dialog__close:hover {
                opacity: 1;
                background-color: #f3f2f2;
              }

              /* Responsive — collapse grids on narrow viewports */
              @media (max-width: 640px) {
                .dialog--xl {
                  max-width: 100%;
                  max-height: 100vh;
                  border-radius: 0;
                }
                .dialog--xl .dialog__grid-3,
                .dialog--xl .dialog__grid-2 {
                  grid-template-columns: 1fr;
                }
              }


`;
}

export function generateComponentsCSS(): string {
  return [
    `/* Mercy Home — Component CSS
 * Every raw CSS pattern used across the Components tab, generated from
 * the same data that drives each pattern's own "Copy CSS" button.
 */`,
    "/* ══ Buttons ══ */",
    generateButtonsSectionCSS(),
    "/* ══ Data Table ══ */",
    dataTableSectionCSS(),
    "/* ══ Form Controls ══ */",
    formControlsSectionCSS(),
    "/* ══ Form Controls — Number / Search / Combobox interaction states ══ */",
    generateFieldStateCSS(),
    "/* ══ Additional Components (Radio, Textarea, Date Picker, Calendar, OTP, Accordion, Dropdown, Drawer, Slider, Pagination, Toggle, Alert Dialog, Toast) ══ */",
    newComponentSectionsCSS(),
    "/* ══ VMS-Ported Patterns, KPI Cards, Dialogs ══ */",
    vmsKpiDialogSectionsCSS(),
  ].join("\n\n");
}

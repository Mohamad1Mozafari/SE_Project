interface ShiftCalendarPickerProps {
    schedule: ScheduleRow[];
    selectedShift?: {
        date: string;
        shiftType: "Morning" | "Evening" | "Night";
    };

    disabledSlots?: {
        date: string;
        shiftType: string;
    }[];

    onSelect(
        date: string,
        shiftType: string,
        operators: string[]
    ): void;
}

// src/app/components/ShiftCalendarPicker.tsx

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export interface ScheduleRow {
  day: string;
  date: string;
  morning: string[];
  evening: string[];
  night: string[];
}

export interface SelectedShift {
  date: string;
  day: string;
  shiftType: "Morning" | "Evening" | "Night";
  operators: string[];
}

interface Props {
  schedule: ScheduleRow[];

  title?: string;

  doneText?: string;

  disabledShifts?: {
    date: string;
    shiftType: string;
  }[];

  initialSelection?: SelectedShift | null;

  onDone(selected: SelectedShift | null): void;

  onCancel?(): void;
}

export default function ShiftCalendarPicker({
  schedule,
  title = "Select Shift",
  doneText = "Done",
  disabledShifts = [],
  initialSelection = null,
  onDone,
  onCancel,
}: Props) {
  const [selected, setSelected] =
    useState<SelectedShift | null>(initialSelection);

  const shiftKeys = [
    {
      key: "morning",
      label: "Morning",
    },
    {
      key: "evening",
      label: "Evening",
    },
    {
      key: "night",
      label: "Night",
    },
  ] as const;

  const isDisabled = (
    date: string,
    shiftType: string
  ) =>
    disabledShifts.some(
      s =>
        s.date === date &&
        s.shiftType === shiftType
    );

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <Card>
        <CardContent className="p-0 overflow-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b">

                <th className="text-left p-3">
                  Day
                </th>

                <th className="text-left p-3">
                  Date
                </th>

                <th className="text-left p-3">
                  Morning
                </th>

                <th className="text-left p-3">
                  Evening
                </th>

                <th className="text-left p-3">
                  Night
                </th>

              </tr>

            </thead>

            <tbody>

              {schedule.map(row => (

                <tr
                  key={row.date}
                  className="border-b"
                >

                  <td className="p-3 font-medium">
                    {row.day}
                  </td>

                  <td className="p-3">
                    {row.date}
                  </td>

                  {shiftKeys.map(shift => {

                    const operators =
                      row[shift.key];

                    const disabled =
                      isDisabled(
                        row.date,
                        shift.label
                      );

                    const selectedCell =
                      selected?.date === row.date &&
                      selected.shiftType === shift.label;

                    return (

                      <td
                        key={shift.label}
                        className="p-2"
                      >

                        <button

                          disabled={disabled}

                          onClick={() =>
                            setSelected({
                              date: row.date,
                              day: row.day,
                              shiftType: shift.label,
                              operators,
                            })
                          }

                          className={`
                            w-full
                            rounded
                            p-2
                            border
                            text-left
                            transition

                            ${
                              disabled
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : ""
                            }

                            ${
                              selectedCell
                                ? "bg-blue-600 text-white border-blue-600"
                                : !disabled
                                ? "hover:bg-blue-50"
                                : ""
                            }
                          `}
                        >

                          <div className="font-medium">
                            {shift.label}
                          </div>

                          <div className="text-xs mt-1">

                            {operators.length === 0
                              ? "No operators"
                              : operators.join(", ")}

                          </div>

                        </button>

                      </td>

                    );

                  })}

                </tr>

              ))}

            </tbody>

          </table>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">

        {onCancel && (

          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>

        )}

        <Button
          disabled={!selected}
          onClick={() =>
            onDone(selected)
          }
        >
          {doneText}
        </Button>

      </div>

    </div>
  );
}
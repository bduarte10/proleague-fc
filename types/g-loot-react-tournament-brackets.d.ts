declare module "@g-loot/react-tournament-brackets" {
  import * as React from "react";

  export type ParticipantType = {
    id: string | number;
    isWinner?: boolean;
    name?: string;
    status?: string | null;
    resultText?: string | null;
    [key: string]: any;
  };

  export type MatchType = {
    id: number | string;
    href?: string;
    name?: string;
    nextMatchId: number | string | null;
    nextLooserMatchId?: number | string;
    tournamentRoundText?: string;
    startTime: string;
    state: string;
    participants: ParticipantType[];
    [key: string]: any;
  };

  export type MatchComponentProps = {
    match: MatchType;
    onMatchClick: (args: {
      match: MatchType;
      topWon: boolean;
      bottomWon: boolean;
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>;
    }) => void;
    onPartyClick: (party: ParticipantType, partyWon: boolean) => void;
    onMouseEnter: (partyId: string | number) => void;
    onMouseLeave: () => void;
    topParty: ParticipantType;
    bottomParty: ParticipantType;
    topWon: boolean;
    bottomWon: boolean;
    topHovered: boolean;
    bottomHovered: boolean;
    topText: string;
    bottomText: string;
    connectorColor?: string;
    computedStyles?: any;
    teamNameFallback: string;
    resultFallback: (participant: ParticipantType) => string;
  };

  export type OptionsType = {
    style?: {
      width?: number;
      boxHeight?: number;
      canvasPadding?: number;
      spaceBetweenColumns?: number;
      spaceBetweenRows?: number;
      connectorColor?: string;
      connectorColorHighlight?: string;
      roundHeader?: {
        isShown?: boolean;
        height?: number;
        marginBottom?: number;
        fontSize?: number;
        fontColor?: string;
        backgroundColor?: string;
        fontFamily?: string;
        roundTextGenerator?: (
          current: number,
          total: number
        ) => string | undefined;
      };
      roundSeparatorWidth?: number;
      lineInfo?: {
        separation?: number;
        homeVisitorSpread?: number;
      };
      horizontalOffset?: number;
      wonBywalkOverText?: string;
      lostByNoShowText?: string;
    };
  };

  export type SvgViewerProps = {
    height: number;
    width: number;
    bracketWidth: number;
    bracketHeight: number;
    children: React.ReactElement;
    startAt?: number[];
    scaleFactor?: number;
  };

  export const MATCH_STATES: Record<string, string>;

  export function SingleEliminationBracket(props: {
    matches: MatchType[];
    matchComponent: (props: MatchComponentProps) => JSX.Element;
    svgWrapper?: (props: SvgViewerProps) => React.ReactElement;
    options?: OptionsType;
    currentRound?: string;
    onMatchClick?: (args: {
      match: MatchType;
      topWon: boolean;
      bottomWon: boolean;
    }) => void;
    onPartyClick?: (party: ParticipantType, partyWon: boolean) => void;
    theme?: any;
  }): JSX.Element;

  export function DoubleEliminationBracket(props: {
    matches: { upper: MatchType[]; lower: MatchType[] };
    matchComponent: (props: MatchComponentProps) => JSX.Element;
    svgWrapper?: (props: SvgViewerProps) => React.ReactElement;
    options?: OptionsType;
    currentRound?: string;
    onMatchClick?: (args: {
      match: MatchType;
      topWon: boolean;
      bottomWon: boolean;
    }) => void;
    onPartyClick?: (party: ParticipantType, partyWon: boolean) => void;
    theme?: any;
  }): JSX.Element;

  export function Match(props: MatchComponentProps): JSX.Element;
  export function SVGViewer(props: SvgViewerProps): JSX.Element;
  export function createTheme(): any;
}


